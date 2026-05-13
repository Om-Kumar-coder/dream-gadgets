import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'client-uuid-1',
    firstName: 'John',
    lastName: 'Doe',
    phone: '9876543210',
    alternatePhone: null,
    email: 'john@example.com',
    gender: null,
    dateOfBirth: null,
    address: null,
    city: null,
    district: null,
    state: null,
    pincode: null,
    idProofType: null,
    idProofNumber: null,
    ekycStatus: 'pending',
    ekycVerifiedAt: null,
    ekycVerifiedBy: null,
    ekycVerifiedById: null,
    ekycDocuments: null,
    customerType: 'walk-in',
    isActive: true,
    birthdayOffer: false,
    notes: null,
    createdBy: null,
    createdById: 'user-1',
    branch: null,
    branchId: 'branch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Client;
}

function makeClientRepo(): any {
  return {
    findOne: jest.fn() as any,
    find: jest.fn() as any,
    create: jest.fn() as any,
    save: jest.fn() as any,
    createQueryBuilder: jest.fn() as any,
  };
}

function makeDataSource(): any {
  return {
    query: jest.fn() as any,
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

describe('ClientService', () => {
  let service: ClientService;
  let clientRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    clientRepo = makeClientRepo();
    dataSource = makeDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: getRepositoryToken(Client), useValue: clientRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  // ─── 8.2: Create client ───────────────────────────────────────────────────

  describe('create()', () => {
    const baseDto = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      branchId: 'branch-1',
    };

    it('should create a client with valid data', async () => {
      const savedClient = makeClient();
      (clientRepo.findOne as any).mockResolvedValue(null); // no duplicate
      (clientRepo.create as any).mockReturnValue(savedClient);
      (clientRepo.save as any).mockResolvedValue(savedClient);

      const result = await service.create(baseDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(clientRepo.save).toHaveBeenCalled();
    });

    it('should reject with PHONE_DUPLICATE if phone already exists', async () => {
      (clientRepo.findOne as any).mockResolvedValue(makeClient()); // duplicate found

      await expect(service.create(baseDto, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(baseDto, 'user-1')).rejects.toMatchObject({
        response: { code: 'PHONE_DUPLICATE' },
      });
    });

    it('should set ekycStatus to pending on creation', async () => {
      const savedClient = makeClient({ ekycStatus: 'pending' });
      (clientRepo.findOne as any).mockResolvedValue(null);
      (clientRepo.create as any).mockReturnValue(savedClient);
      (clientRepo.save as any).mockResolvedValue(savedClient);

      await service.create(baseDto, 'user-1');

      expect(clientRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ekycStatus: 'pending' }),
      );
    });

    it('should set isActive to true on creation', async () => {
      const savedClient = makeClient({ isActive: true });
      (clientRepo.findOne as any).mockResolvedValue(null);
      (clientRepo.create as any).mockReturnValue(savedClient);
      (clientRepo.save as any).mockResolvedValue(savedClient);

      await service.create(baseDto, 'user-1');

      expect(clientRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should convert dateOfBirth string to Date', async () => {
      const dto = { ...baseDto, dateOfBirth: '1990-05-15' };
      const savedClient = makeClient({ dateOfBirth: new Date('1990-05-15') });
      (clientRepo.findOne as any).mockResolvedValue(null);
      (clientRepo.create as any).mockReturnValue(savedClient);
      (clientRepo.save as any).mockResolvedValue(savedClient);

      await service.create(dto, 'user-1');

      const createCall = (clientRepo.create as any).mock.calls[0][0];
      expect(createCall.dateOfBirth).toBeInstanceOf(Date);
    });
  });

  // ─── 8.2: Get client by ID ────────────────────────────────────────────────

  describe('findById()', () => {
    it('should return client when found', async () => {
      const client = makeClient();
      (clientRepo.findOne as any).mockResolvedValue(client);

      const result = await service.findById('client-uuid-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('client-uuid-1');
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 8.2: List clients ────────────────────────────────────────────────────

  describe('findAll()', () => {
    function makeQueryBuilder(data: Client[], total: number): any {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: (jest.fn() as any).mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('should return paginated list of clients', async () => {
      const clients = [makeClient()];
      const qb = makeQueryBuilder(clients, 1);
      (clientRepo.createQueryBuilder as any).mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply search filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (clientRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ search: 'John' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%John%' }),
      );
    });

    it('should apply branchId filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (clientRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ branchId: 'branch-1' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'client.branchId = :branchId',
        { branchId: 'branch-1' },
      );
    });

    it('should apply customerType filter when provided', async () => {
      const qb = makeQueryBuilder([], 0);
      (clientRepo.createQueryBuilder as any).mockReturnValue(qb);

      await service.findAll({ customerType: 'corporate' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'client.customerType = :customerType',
        { customerType: 'corporate' },
      );
    });
  });

  // ─── 8.2: Update client ───────────────────────────────────────────────────

  describe('update()', () => {
    it('should update client fields', async () => {
      const client = makeClient();
      const updated = { ...client, notes: 'VIP customer' };
      (clientRepo.findOne as any).mockResolvedValue(client);
      (clientRepo.save as any).mockResolvedValue(updated);

      const result = await service.update('client-uuid-1', { notes: 'VIP customer' });

      expect(result.notes).toBe('VIP customer');
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.update('non-existent', { notes: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('should reject phone update if new phone already exists', async () => {
      const client = makeClient({ phone: '9876543210' });
      const existingWithNewPhone = makeClient({ id: 'other-id', phone: '9999999999' });

      (clientRepo.findOne as any)
        .mockResolvedValueOnce(client)       // first call: find by id
        .mockResolvedValueOnce(existingWithNewPhone); // second call: check phone duplicate

      await expect(service.update('client-uuid-1', { phone: '9999999999' })).rejects.toThrow(BadRequestException);
    });
  });

  // ─── 8.4: EKYC ───────────────────────────────────────────────────────────

  describe('uploadEkycDocuments()', () => {
    it('should store documents and set ekycStatus to pending', async () => {
      const client = makeClient({ ekycStatus: 'verified' });
      const docs = { front: 'url1', back: 'url2' };
      (clientRepo.findOne as any).mockResolvedValue(client);
      (clientRepo.save as any).mockResolvedValue({ ...client, ekycDocuments: docs, ekycStatus: 'pending' });

      const result = await service.uploadEkycDocuments('client-uuid-1', docs);

      expect(clientRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ ekycDocuments: docs, ekycStatus: 'pending' }),
      );
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.uploadEkycDocuments('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEkyc()', () => {
    it('should set ekycStatus to verified with timestamp and userId', async () => {
      const client = makeClient({ ekycStatus: 'pending' });
      (clientRepo.findOne as any).mockResolvedValue(client);
      (clientRepo.save as any).mockResolvedValue({
        ...client,
        ekycStatus: 'verified',
        ekycVerifiedAt: new Date(),
        ekycVerifiedById: 'user-1',
      });

      await service.verifyEkyc('client-uuid-1', 'user-1');

      expect(clientRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ekycStatus: 'verified',
          ekycVerifiedById: 'user-1',
        }),
      );
      const saveArg = (clientRepo.save as any).mock.calls[0][0];
      expect(saveArg.ekycVerifiedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.verifyEkyc('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 8.5: Notifications ──────────────────────────────────────────────────

  describe('sendEmail()', () => {
    it('should return success message', async () => {
      (clientRepo.findOne as any).mockResolvedValue(makeClient());

      const result = await service.sendEmail('client-uuid-1', { subject: 'Hello', body: 'World' });

      expect(result.message).toContain('client-uuid-1');
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.sendEmail('non-existent', { subject: 'x', body: 'y' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendWhatsapp()', () => {
    it('should return success message', async () => {
      (clientRepo.findOne as any).mockResolvedValue(makeClient());

      const result = await service.sendWhatsapp('client-uuid-1', { message: 'Hi there' });

      expect(result.message).toContain('client-uuid-1');
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.sendWhatsapp('non-existent', { message: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── 8.3: History ────────────────────────────────────────────────────────

  describe('getHistory()', () => {
    it('should return history object with all four categories', async () => {
      (clientRepo.findOne as any).mockResolvedValue(makeClient());
      (dataSource.query as any).mockResolvedValue([]);

      const result = await service.getHistory('client-uuid-1');

      expect(result).toHaveProperty('purchases');
      expect(result).toHaveProperty('sales');
      expect(result).toHaveProperty('exchanges');
      expect(result).toHaveProperty('returns');
    });

    it('should throw NotFoundException when client not found', async () => {
      (clientRepo.findOne as any).mockResolvedValue(null);

      await expect(service.getHistory('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return empty arrays when tables do not exist', async () => {
      (clientRepo.findOne as any).mockResolvedValue(makeClient());
      (dataSource.query as any).mockRejectedValue(new Error('table does not exist'));

      const result = await service.getHistory('client-uuid-1');

      expect(result.purchases).toEqual([]);
      expect(result.sales).toEqual([]);
      expect(result.exchanges).toEqual([]);
      expect(result.returns).toEqual([]);
    });
  });
});
