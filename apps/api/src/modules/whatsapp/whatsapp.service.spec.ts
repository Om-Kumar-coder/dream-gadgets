import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappConversation } from './entities/whatsapp-conversation.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';

/**
 * BUG-22 — `GET /whatsapp/conversations/:id/messages` used to reset
 * `unread_count` as a side effect of reading. Reading must be side-effect
 * free; clearing the badge is now an explicit
 * `PATCH /whatsapp/conversations/:id/read` → `markConversationRead()`.
 */
describe('WhatsappService (BUG-22 — GET must not mutate)', () => {
  let service: WhatsappService;
  let conversationRepo: any;
  let messageRepo: any;

  beforeEach(async () => {
    conversationRepo = {
      findOne: jest.fn(async () => ({ id: 'conv-1', unreadCount: 3 })),
      update: jest.fn(async () => undefined),
    };
    messageRepo = {
      findAndCount: jest.fn(async () => [[{ id: 'msg-1', content: 'hi' }], 1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappService,
        { provide: getRepositoryToken(WhatsappConversation), useValue: conversationRepo },
        { provide: getRepositoryToken(WhatsappMessage), useValue: messageRepo },
        { provide: DataSource, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn(() => undefined) } },
      ],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
  });

  it('getMessages returns messages WITHOUT clearing the unread count', async () => {
    const result = await service.getMessages('conv-1', 1, 50);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(conversationRepo.update).not.toHaveBeenCalled();
  });

  it('markConversationRead explicitly clears the unread count', async () => {
    const result = await service.markConversationRead('conv-1');

    expect(conversationRepo.update).toHaveBeenCalledWith('conv-1', { unreadCount: 0 });
    expect(result).toEqual({ unreadCount: 0 });
  });

  it('markConversationRead skips the write when already read', async () => {
    conversationRepo.findOne.mockResolvedValue({ id: 'conv-1', unreadCount: 0 });

    const result = await service.markConversationRead('conv-1');

    expect(conversationRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual({ unreadCount: 0 });
  });

  it('markConversationRead throws NotFound for an unknown conversation', async () => {
    conversationRepo.findOne.mockResolvedValue(null);

    await expect(service.markConversationRead('nope')).rejects.toThrow(NotFoundException);
  });
});
