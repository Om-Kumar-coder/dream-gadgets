import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Accessory } from './entities/accessory.entity';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';
import { QueryAccessoryDto } from './dto/query-accessory.dto';

@Injectable()
export class AccessoryService {
  constructor(
    @InjectRepository(Accessory)
    private accessoryRepo: Repository<Accessory>,
  ) {}

  // ─── Create accessory ─────────────────────────────────────────────────────────

  async create(dto: CreateAccessoryDto, userId: string): Promise<Accessory> {
    // Check duplicate SKU
    const existing = await this.accessoryRepo.findOne({ where: { sku: dto.sku } });
    if (existing) {
      throw new ConflictException({
        code: 'SKU_DUPLICATE',
        message: `An accessory with SKU ${dto.sku} already exists`,
      });
    }

    const accessory = this.accessoryRepo.create({
      ...dto,
      createdById: userId,
      status: 'available',
    });

    return this.accessoryRepo.save(accessory);
  }

  // ─── List accessories (paginated + filtered) ────────────────────────────────

  async findAll(query: QueryAccessoryDto): Promise<{ data: Accessory[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, category, status, brandId, minPrice, maxPrice, search } = query;

    const qb = this.accessoryRepo
      .createQueryBuilder('acc')
      .leftJoinAndSelect('acc.brand', 'brand')
      .leftJoinAndSelect('acc.model', 'model')
      .leftJoinAndSelect('acc.branch', 'branch')
      .orderBy('acc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) qb.andWhere('acc.category = :category', { category });
    if (status) qb.andWhere('acc.status = :status', { status });
    if (brandId) qb.andWhere('acc.brandId = :brandId', { brandId });
    if (minPrice !== undefined) qb.andWhere('acc.sellingPrice >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('acc.sellingPrice <= :maxPrice', { maxPrice });
    if (search) {
      qb.andWhere(
        '(acc.sku ILIKE :search OR acc.name ILIKE :search OR brand.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── Get by ID / SKU ────────────────────────────────────────────────────────

  async findById(id: string): Promise<Accessory> {
    const accessory = await this.accessoryRepo.findOne({
      where: { id },
      relations: ['brand', 'model', 'branch'],
    });
    if (!accessory) throw new NotFoundException(`Accessory ${id} not found`);
    return accessory;
  }

  async findBySku(sku: string): Promise<Accessory> {
    const accessory = await this.accessoryRepo.findOne({
      where: { sku },
      relations: ['brand', 'model', 'branch'],
    });
    if (!accessory) throw new NotFoundException(`No accessory found with SKU ${sku}`);
    return accessory;
  }

  // ─── Update accessory ───────────────────────────────────────────────────────

  async update(id: string, dto: UpdateAccessoryDto): Promise<Accessory> {
    const accessory = await this.findById(id);

    // Check duplicate SKU if changing
    if (dto.sku && dto.sku !== accessory.sku) {
      const existing = await this.accessoryRepo.findOne({ where: { sku: dto.sku } });
      if (existing && existing.id !== id) {
        throw new ConflictException({
          code: 'SKU_DUPLICATE',
          message: `An accessory with SKU ${dto.sku} already exists`,
        });
      }
    }

    Object.assign(accessory, dto);

    // Pricing rule: a published (online) accessory must always carry a price.
    // Mirrors the inventory guard — update() cannot clear the price of a
    // listed accessory (take it offline first).
    if (
      accessory.isOnline &&
      (accessory.sellingPrice == null || Number(accessory.sellingPrice) <= 0)
    ) {
      throw new BadRequestException({
        code: 'ONLINE_ITEM_REQUIRES_PRICE',
        message: 'This accessory is listed online — set a selling price (or take it offline) before clearing the current one.',
      });
    }

    return this.accessoryRepo.save(accessory);
  }

  // ─── Stock adjustment ───────────────────────────────────────────────────────

  async adjustStock(id: string, quantity: number, reason: string): Promise<Accessory> {
    const accessory = await this.findById(id);
    accessory.stockQuantity += quantity;

    if (accessory.stockQuantity < 0) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_STOCK',
        message: `Insufficient stock. Current: ${accessory.stockQuantity}, Requested: ${quantity}`,
      });
    }

    return this.accessoryRepo.save(accessory);
  }

  // ─── Toggle online ──────────────────────────────────────────────────────────

  async toggleOnline(id: string): Promise<Accessory> {
    const accessory = await this.findById(id);

    // Publishing guard (mirrors InventoryService.toggleOnline): an accessory
    // cannot be listed online without a selling price. Taking offline is fine.
    const willBeOnline = !accessory.isOnline;
    if (
      willBeOnline &&
      (accessory.sellingPrice == null || Number(accessory.sellingPrice) <= 0)
    ) {
      throw new BadRequestException({
        code: 'NO_SELLING_PRICE',
        message: 'Set a selling price before listing this accessory online.',
      });
    }

    accessory.isOnline = willBeOnline;
    return this.accessoryRepo.save(accessory);
  }

  // ─── Low stock alert ────────────────────────────────────────────────────────

  async getLowStockAlerts(): Promise<Accessory[]> {
    return this.accessoryRepo.query(`
      SELECT a.* 
      FROM accessories a
      WHERE a.stock_quantity < a.reorder_level
    `);
  }
}