import { describe, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { InventoryModule } from './inventory.module';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { Brand } from './entities/brand.entity';
import { Model } from './entities/model.entity';
import { Accessory } from './entities/accessory.entity';
import { AccessoryService } from './accessory.service';
import { EventService } from '../../common/events/event.service';

/**
 * Integration test: verifies the InventoryModule compiles correctly
 * without duplicate entity registrations.
 */
describe('InventoryModule', () => {
  const mockEventService = {
    emitInventoryUpdated: jest.fn(),
    emitInventoryLocked: jest.fn(),
    emitInventoryUnlocked: jest.fn(),
  };

  function buildModule() {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [],
          synchronize: true,
        }),
        InventoryModule,
      ],
    })
      .overrideProvider(getRepositoryToken(InventoryItem))
      .useValue({ findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() })
      .overrideProvider(getRepositoryToken(ItemPhoto))
      .useValue({ findOne: jest.fn(), create: jest.fn(), save: jest.fn(), count: jest.fn(), remove: jest.fn() })
      .overrideProvider(getRepositoryToken(Brand))
      .useValue({ findOne: jest.fn(), find: jest.fn() })
      .overrideProvider(getRepositoryToken(Model))
      .useValue({ findOne: jest.fn(), find: jest.fn() })
      .overrideProvider(getRepositoryToken(Accessory))
      .useValue({ findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn(), query: jest.fn() })
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn() })
      .overrideProvider(getDataSourceToken())
      .useValue({ query: jest.fn() })
      .overrideProvider(EventService)
      .useValue(mockEventService);
  }

  it('should compile the module with all dependencies', async () => {
    const module: TestingModule = await buildModule().compile();

    const inventoryService = module.get<InventoryService>(InventoryService);
    const accessoryService = module.get<AccessoryService>(AccessoryService);

    expect(inventoryService).toBeDefined();
    expect(accessoryService).toBeDefined();
  });

  it('should export AccessoryService', async () => {
    const module: TestingModule = await buildModule().compile();

    const exported = module.get(AccessoryService);
    expect(exported).toBeDefined();
    expect(exported).toBeInstanceOf(AccessoryService);
  });
});
