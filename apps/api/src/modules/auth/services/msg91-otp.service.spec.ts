import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Msg91OtpService } from './msg91-otp.service';
import { RedisService } from '../../../common/redis/redis.service';

function makeConfigService(overrides: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        MSG91_AUTH_KEY: 'test-auth-key',
        MSG91_TEMPLATE_ID: 'test-template-id',
        MSG91_OTP_TTL: '600',
        ...overrides,
      };
      return map[key] ?? undefined;
    }),
  };
}

function makeRedisServiceMock() {
  const store: Record<string, string> = {};
  const attempts: Record<string, number> = {};
  return {
    setOtp: jest.fn(async (phone: string, otp: string, ttl: number) => {
      store[`otp:${phone}`] = otp;
    }),
    getOtp: jest.fn(async (phone: string) => store[`otp:${phone}`] ?? null),
    delOtp: jest.fn(async (phone: string) => {
      delete store[`otp:${phone}`];
    }),
    incrementOtpAttempts: jest.fn(async (phone: string, _ttl: number) => {
      attempts[phone] = (attempts[phone] ?? 0) + 1;
      return attempts[phone];
    }),
    clearOtpAttempts: jest.fn(async (phone: string) => {
      delete attempts[phone];
    }),
  };
}

describe('Msg91OtpService', () => {
  let service: Msg91OtpService;
  let redisMock: ReturnType<typeof makeRedisServiceMock>;
  let configMock: any;
  let originalFetch: typeof fetch | undefined;

  beforeEach(async () => {
    originalFetch = global.fetch;
    redisMock = makeRedisServiceMock();
    configMock = makeConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Msg91OtpService,
        { provide: ConfigService, useValue: configMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<Msg91OtpService>(Msg91OtpService);
  });

  afterEach(() => {
    if (originalFetch === undefined) {
      delete (global as any).fetch;
    } else {
      (global as any).fetch = originalFetch;
    }
    jest.restoreAllMocks();
  });

  // ─── sendOtp: MSG91 configured ───────────────────────────────────────────

  describe('sendOtp()', () => {
    it('should generate, store the OTP and call MSG91 when configured', async () => {
      const fetchMock = jest.fn(async () => ({
        ok: true,
        json: async () => ({ type: 'success', message: 'OTP sent successfully', request_id: 'req-123' }),
      }));
      (global as any).fetch = fetchMock;

      const result = await service.sendOtp('+919876543210');

      expect(result.success).toBe(true);
      expect(result.status).toBe('sent');
      // OTP must be stored in Redis under the normalized phone key
      const stored = await redisMock.getOtp('919876543210');
      expect(stored).toMatch(/^\d{6}$/);
      // MSG91 called with correct params
      const url: string = (fetchMock.mock.calls[0] as any[])[0];
      expect(url).toContain('https://control.msg91.com/api/v5/otp');
      expect(url).toContain('authkey=test-auth-key');
      expect(url).toContain('template_id=test-template-id');
      expect(url).toContain('mobile=919876543210');
      expect(url).toContain(`otp=${stored}`);
    });

    it('should store the OTP and skip the API call when MSG91 is not configured (dev-mode)', async () => {
      const fetchMock = jest.fn();
      (global as any).fetch = fetchMock;

      configMock = makeConfigService({ MSG91_AUTH_KEY: '', MSG91_TEMPLATE_ID: '' });
      const module = await Test.createTestingModule({
        providers: [
          Msg91OtpService,
          { provide: ConfigService, useValue: configMock },
          { provide: RedisService, useValue: redisMock },
        ],
      }).compile();
      service = module.get<Msg91OtpService>(Msg91OtpService);

      const result = await service.sendOtp('9876543210');

      expect(result.success).toBe(true);
      expect(result.status).toBe('dev-mode');
      const stored = await redisMock.getOtp('9876543210');
      expect(stored).toMatch(/^\d{6}$/);
      // Dev-mode surfaces the OTP so the frontend can display it for local testing
      expect(result.otp).toBe(stored);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fail loudly when MSG91 is unconfigured in production (no silent dev-mode)', async () => {
      const fetchMock = jest.fn();
      (global as any).fetch = fetchMock;
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        configMock = makeConfigService({ MSG91_AUTH_KEY: '', MSG91_TEMPLATE_ID: '' });
        const module = await Test.createTestingModule({
          providers: [
            Msg91OtpService,
            { provide: ConfigService, useValue: configMock },
            { provide: RedisService, useValue: redisMock },
          ],
        }).compile();
        service = module.get<Msg91OtpService>(Msg91OtpService);

        const result = await service.sendOtp('9876543210');

        expect(result.success).toBe(false);
        expect(result.status).toBe('failed');
        expect(result.otp).toBeUndefined();
        // No OTP left dangling in Redis
        expect(await redisMock.getOtp('9876543210')).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    it('should return failure and clear the stored OTP when MSG91 responds with an error', async () => {
      (global as any).fetch = jest.fn(async () => ({
        ok: true,
        json: async () => ({ type: 'error', message: 'Invalid template' }),
      }));

      const result = await service.sendOtp('9876543210');

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Invalid template');
      expect(await redisMock.getOtp('9876543210')).toBeNull();
    });

    it('should return failure and clear the stored OTP when the MSG91 call throws', async () => {
      (global as any).fetch = jest.fn(async () => {
        throw new Error('network down');
      });

      const result = await service.sendOtp('9876543210');

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('network down');
      expect(await redisMock.getOtp('9876543210')).toBeNull();
    });
  });

  // ─── verifyOtp ──────────────────────────────────────────────────────────

  describe('verifyOtp()', () => {
    it('should approve a correct code and delete it (single-use)', async () => {
      await redisMock.setOtp('919876543210', '123456', 600);

      // Phone with '+' normalizes to the same key used at store time
      const result = await service.verifyOtp('+919876543210', '123456');

      expect(result.success).toBe(true);
      expect(result.status).toBe('approved');
      expect(await redisMock.getOtp('919876543210')).toBeNull();
      expect(redisMock.clearOtpAttempts).toHaveBeenCalled();
    });

    it('should reject a wrong code and keep the stored OTP', async () => {
      await redisMock.setOtp('9876543210', '123456', 600);

      const result = await service.verifyOtp('9876543210', '000000');

      expect(result.success).toBe(false);
      expect(result.status).toBe('pending');
      expect(await redisMock.getOtp('9876543210')).toBe('123456');
    });

    it('should reject when no OTP was requested or it expired', async () => {
      const result = await service.verifyOtp('9876543210', '123456');

      expect(result.success).toBe(false);
      expect(result.status).toBe('expired');
    });

    it('should lock the OTP after too many failed attempts', async () => {
      await redisMock.setOtp('9876543210', '123456', 600);
      // Exhaust the 5 allowed attempts
      for (let i = 0; i < 5; i++) {
        await service.verifyOtp('9876543210', '000000');
      }

      const result = await service.verifyOtp('9876543210', '000000');

      expect(result.success).toBe(false);
      expect(result.status).toBe('locked');
      expect(await redisMock.getOtp('9876543210')).toBeNull();
    });
  });

  // ─── OTP generation ─────────────────────────────────────────────────────

  describe('generateOtp()', () => {
    it('should always produce a 6-digit code', async () => {
      for (let i = 0; i < 5; i++) {
        const phone = `987654321${i}`; // 10-digit so normalization keeps it intact
        await service.sendOtp(phone);
        const stored = await redisMock.getOtp(phone);
        expect(stored).toMatch(/^\d{6}$/);
      }
    });
  });
});
