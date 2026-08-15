import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeDevice } from './entities/exchange-device.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { QueryExchangeDto } from './dto/query-exchange.dto';
import { calculateExchangePrice } from '../../common/utils/business-logic';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(ExchangeDevice)
    private exchangeRepo: Repository<ExchangeDevice>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
  ) {}

  // ─── 10.2 Create exchange ────────────────────────────────────────────────────

  async create(dto: CreateExchangeDto, userId: string): Promise<ExchangeDevice> {
    const exchange = this.exchangeRepo.create({
      ...dto,
      createdById: userId,
      addedToInventory: false,
      kycVerified: dto.kycVerified ?? false,
    });
    return this.exchangeRepo.save(exchange);
  }

  // ─── 10.5 List exchanges ─────────────────────────────────────────────────────

  async findAll(query: QueryExchangeDto): Promise<{ data: ExchangeDevice[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, clientId, modelId, condition, search, addedToInventory } = query;

    const qb = this.exchangeRepo
      .createQueryBuilder('exchange')
      .orderBy('exchange.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (clientId) qb.andWhere('exchange.clientId = :clientId', { clientId });
    if (modelId) qb.andWhere('exchange.modelId = :modelId', { modelId });
    if (condition) qb.andWhere('exchange.condition = :condition', { condition });
    if (search) {
      qb.andWhere('exchange.imei ILIKE :search', { search: `%${search}%` });
    }
    if (addedToInventory !== undefined) {
      qb.andWhere('exchange.addedToInventory = :addedToInventory', { addedToInventory });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── 10.5 Get exchange by ID ─────────────────────────────────────────────────

  async findById(id: string): Promise<ExchangeDevice> {
    const exchange = await this.exchangeRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!exchange) throw new NotFoundException(`Exchange ${id} not found`);
    return exchange;
  }

  // ─── 10.5 Update exchange ────────────────────────────────────────────────────

  async update(id: string, dto: Partial<CreateExchangeDto>): Promise<ExchangeDevice> {
    const exchange = await this.exchangeRepo.findOne({ where: { id } });
    if (!exchange) throw new NotFoundException(`Exchange ${id} not found`);

    Object.assign(exchange, dto);
    return this.exchangeRepo.save(exchange);
  }

  // ─── 10.3 Price suggestion ───────────────────────────────────────────────────

  async suggestPrice(params: {
    basePrice: number;
    batteryHealth: number;
    monthsSinceFirstInvoice: number;
  }): Promise<{ suggestedPrice: number; batteryHealth: number; monthsSinceFirstInvoice: number; basePrice: number }> {
    const { basePrice, batteryHealth, monthsSinceFirstInvoice } = params;
    const suggestedPrice = calculateExchangePrice(basePrice, batteryHealth, monthsSinceFirstInvoice);
    return { suggestedPrice, batteryHealth, monthsSinceFirstInvoice, basePrice };
  }

  // ─── 10.4 Add exchanged device to inventory ──────────────────────────────────

  async addToInventory(id: string, inventoryData: {
    branchId: string;
    boxType?: string;
    purchasePrice?: number;
    taxRate?: number;
    createdById?: string;
  }): Promise<ExchangeDevice> {
    const exchange = await this.exchangeRepo.findOne({ where: { id } });
    if (!exchange) throw new NotFoundException(`Exchange ${id} not found`);

    if (exchange.addedToInventory) {
      throw new BadRequestException({
        code: 'ALREADY_IN_INVENTORY',
        message: 'This exchange device has already been added to inventory',
      });
    }

    const purchasePrice = inventoryData.purchasePrice ?? Number(exchange.exchangePrice);
    const taxRate = inventoryData.taxRate ?? 0;
    const taxAmount = (purchasePrice * taxRate) / 100;
    const totalCost = purchasePrice + taxAmount;

    // Create inventory item from exchange device data
    const newItem = this.itemRepo.create({
      imei: exchange.imei ?? `EX-${Date.now()}`,
      brandId: exchange.brandId ?? undefined,
      modelId: exchange.modelId ?? undefined,
      colour: exchange.colour ?? undefined,
      storage: exchange.storage ?? undefined,
      condition: exchange.condition ?? 'good',
      batteryHealth: exchange.batteryHealth ?? undefined,
      boxType: inventoryData.boxType ?? 'without_box',
      purchasePrice,
      taxRate,
      taxAmount,
      totalCost,
      status: 'available',
      branchId: inventoryData.branchId,
      createdById: inventoryData.createdById ?? exchange.createdById,
      notes: `Added from exchange ${id}`,
    });

    const savedItem = await this.itemRepo.save(newItem);

    // Update exchange record
    exchange.addedToInventory = true;
    exchange.inventoryItemId = savedItem.id;
    await this.exchangeRepo.save(exchange);

    return this.findById(id);
  }

  // ─── 10.6 Price guide ────────────────────────────────────────────────────────

  async getPriceGuide(modelId?: string): Promise<Array<{ modelId: string; condition: string; basePrice: number }>> {
    try {
      // Query exchange_price_guide table if it exists
      const qb = this.exchangeRepo.manager
        .createQueryBuilder()
        .select(['epg.model_id AS "modelId"', 'epg.condition AS condition', 'epg.base_price AS "basePrice"'])
        .from('exchange_price_guide', 'epg');

      if (modelId) {
        qb.where('epg.model_id = :modelId', { modelId });
      }

      return await qb.getRawMany();
    } catch {
      // Table doesn't exist — return empty array gracefully
      return [];
    }
  }

  /**
   * Upsert a single (model, condition) price-guide row.
   * Records an audit entry with old vs new price.
   */
  async upsertPriceGuide(
    modelId: string,
    condition: string,
    basePrice: number,
    updatedBy?: string,
  ): Promise<{ modelId: string; condition: string; basePrice: number }> {
    const manager = this.exchangeRepo.manager;
    const normalizedCondition = condition.toLowerCase();

    const existing = await manager.query(
      `SELECT base_price FROM exchange_price_guide WHERE model_id = $1 AND condition = $2`,
      [modelId, normalizedCondition],
    ).catch(() => []);

    await manager.query(
      `INSERT INTO exchange_price_guide (model_id, condition, base_price, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (model_id, condition)
       DO UPDATE SET base_price = EXCLUDED.base_price, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
      [modelId, normalizedCondition, basePrice, updatedBy ?? null],
    ).catch(() => {
      throw new BadRequestException({
        code: 'PRICE_GUIDE_WRITE_FAILED',
        message: 'Could not write price guide entry — is the table seeded?',
      });
    });

    const oldPrice = existing[0]?.base_price != null ? parseFloat(existing[0].base_price) : null;
    await this.logAudit(modelId, normalizedCondition, oldPrice, basePrice, 'upsert', updatedBy);

    return { modelId, condition: normalizedCondition, basePrice };
  }

  /**
   * Delete a (model, condition) price-guide row.
   */
  async deletePriceGuide(modelId: string, condition: string, updatedBy?: string): Promise<{ deleted: boolean }> {
    const manager = this.exchangeRepo.manager;
    const normalizedCondition = condition.toLowerCase();

    const existing = await manager.query(
      `SELECT base_price FROM exchange_price_guide WHERE model_id = $1 AND condition = $2`,
      [modelId, normalizedCondition],
    ).catch(() => []);

    await manager.query(
      `DELETE FROM exchange_price_guide WHERE model_id = $1 AND condition = $2`,
      [modelId, normalizedCondition],
    ).catch(() => {
      throw new BadRequestException({ code: 'PRICE_GUIDE_DELETE_FAILED', message: 'Could not delete price guide entry' });
    });

    const oldPrice = existing[0]?.base_price != null ? parseFloat(existing[0].base_price) : null;
    await this.logAudit(modelId, normalizedCondition, oldPrice, null, 'delete', updatedBy);

    return { deleted: true };
  }

  async getPriceGuideAudits(limit = 50): Promise<Array<Record<string, any>>> {
    try {
      return await this.exchangeRepo.manager.query(
        `SELECT
           pga.id, pga.model_id AS "modelId", pga.model_name AS "modelName",
           pga.condition, pga.old_price AS "oldPrice", pga.new_price AS "newPrice",
           pga.action, pga.created_at AS "createdAt",
           u.first_name AS "updatedByFirstName", u.last_name AS "updatedByLastName"
         FROM price_guide_audits pga
         LEFT JOIN users u ON u.id = pga.updated_by
         ORDER BY pga.created_at DESC
         LIMIT $1`,
        [Math.min(500, Math.max(1, limit))],
      );
    } catch {
      return [];
    }
  }

  private async logAudit(
    modelId: string,
    condition: string,
    oldPrice: number | null,
    newPrice: number | null,
    action: string,
    updatedBy?: string,
  ): Promise<void> {
    try {
      const modelName = await this.exchangeRepo.manager.query(
        'SELECT name FROM models WHERE id = $1',
        [modelId],
      ).catch(() => []);

      await this.exchangeRepo.manager.query(
        `INSERT INTO price_guide_audits (model_id, model_name, condition, old_price, new_price, action, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          modelId,
          modelName?.[0]?.name ?? null,
          condition,
          oldPrice,
          newPrice,
          action,
          updatedBy ?? null,
        ],
      );
    } catch {
      // Audit failures are non-critical
    }
  }
}
