import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    private dataSource: DataSource,
  ) {}

  // ─── 8.2 Create client ───────────────────────────────────────────────────────

  async create(dto: CreateClientDto, userId: string): Promise<Client> {
    // Check phone uniqueness
    const existing = await this.clientRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new BadRequestException({
        code: 'PHONE_DUPLICATE',
        message: `A client with phone ${dto.phone} already exists`,
      });
    }

    const client = this.clientRepo.create({
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      ekycStatus: 'pending',
      isActive: true,
      createdById: userId,
    });

    return this.clientRepo.save(client);
  }

  // ─── 8.2 List clients ────────────────────────────────────────────────────────

  async findAll(query: QueryClientDto): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, branchId, customerType, ekycStatus } = query;

    const qb = this.clientRepo
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.branch', 'branch')
      .orderBy('client.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (branchId) qb.andWhere('client.branchId = :branchId', { branchId });
    if (customerType) qb.andWhere('client.customerType = :customerType', { customerType });
    if (ekycStatus) qb.andWhere('client.ekycStatus = :ekycStatus', { ekycStatus });
    if (search) {
      qb.andWhere(
        '(client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.phone ILIKE :search OR client.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ─── 8.2 Get client by ID ────────────────────────────────────────────────────

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: ['branch', 'createdBy'],
    });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  // ─── 8.2 Update client ───────────────────────────────────────────────────────

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    // Check phone uniqueness if phone is being changed
    if (dto.phone && dto.phone !== client.phone) {
      const existing = await this.clientRepo.findOne({ where: { phone: dto.phone } });
      if (existing) {
        throw new BadRequestException({
          code: 'PHONE_DUPLICATE',
          message: `A client with phone ${dto.phone} already exists`,
        });
      }
    }

    if (dto.dateOfBirth) {
      (dto as any).dateOfBirth = new Date(dto.dateOfBirth);
    }

    Object.assign(client, dto);
    return this.clientRepo.save(client);
  }

  // ─── 8.3 Get client history ──────────────────────────────────────────────────

  async getHistory(id: string): Promise<{
    purchases: any[];
    sales: any[];
    exchanges: any[];
    returns: any[];
  }> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    const db = this.dataSource;

    // Query each table — gracefully handle missing tables
    const safeQuery = async (sql: string, params: any[]): Promise<any[]> => {
      try {
        return await db.query(sql, params);
      } catch {
        return [];
      }
    };

    const [purchases, sales, exchanges, returns] = await Promise.all([
      safeQuery(
        `SELECT p.id, p.invoice_number, p.vendor_name, p.total_amount, p.purchase_date, p.status
         FROM purchases p
         JOIN inventory_items ii ON ii.purchase_id = p.id
         WHERE ii.id IN (
           SELECT item_id FROM sale_items si
           JOIN sales s ON s.id = si.sale_id WHERE s.client_id = $1
         )
         UNION
         SELECT p.id, p.invoice_number, p.vendor_name, p.total_amount, p.purchase_date, p.status
         FROM purchases p WHERE p.created_by_id = $1
         LIMIT 50`,
        [id],
      ),
      safeQuery(
        `SELECT s.id, s.invoice_number, s.total_amount, s.sale_date, s.payment_status, s.is_voided
         FROM sales s WHERE s.client_id = $1 ORDER BY s.sale_date DESC LIMIT 50`,
        [id],
      ),
      safeQuery(
        `SELECT e.id, e.exchange_price, e.condition, e.created_at
         FROM exchange_devices e WHERE e.client_id = $1 ORDER BY e.created_at DESC LIMIT 50`,
        [id],
      ),
      safeQuery(
        `SELECT r.id, r.return_amount, r.reason, r.status, r.created_at
         FROM returns r WHERE r.client_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
        [id],
      ),
    ]);

    return { purchases, sales, exchanges, returns };
  }

  // ─── 8.4 EKYC upload documents ──────────────────────────────────────────────

  async uploadEkycDocuments(id: string, documents: object): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    client.ekycDocuments = documents;
    client.ekycStatus = 'pending';
    return this.clientRepo.save(client);
  }

  // ─── 8.4 EKYC verify ────────────────────────────────────────────────────────

  async verifyEkyc(id: string, userId: string): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    client.ekycStatus = 'verified';
    client.ekycVerifiedAt = new Date();
    client.ekycVerifiedById = userId;
    return this.clientRepo.save(client);
  }

  // ─── 8.5 Send email ──────────────────────────────────────────────────────────

  async sendEmail(id: string, payload: { subject: string; body: string }): Promise<{ message: string }> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    // In production: enqueue notification job
    console.log(`[Client] Email to ${client.email ?? client.phone}: ${payload.subject}`);
    return { message: `Email queued for client ${id}` };
  }

  // ─── 8.5 Send WhatsApp ───────────────────────────────────────────────────────

  async sendWhatsapp(id: string, payload: { message: string }): Promise<{ message: string }> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);

    // In production: enqueue notification job
    console.log(`[Client] WhatsApp to ${client.phone}: ${payload.message}`);
    return { message: `WhatsApp message queued for client ${id}` };
  }
}
