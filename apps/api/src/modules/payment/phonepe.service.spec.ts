import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';

/**
 * BUG-02 — PhonePe mock paths were gated only on `isConfigured`, so an
 * unconfigured production deployment returned `state: 'COMPLETED'` for every
 * payment status check and confirmed orders nobody ever paid for.
 *
 * Contract under test:
 *  - production + unconfigured  → every mock path FAILS LOUDLY (no fabrication)
 *  - non-production + unconfigured → dev mocks still work (local/CI flows)
 */
describe('PhonePeService', () => {
  let service: PhonePeService;
  let prevEnv: string | undefined;

  beforeEach(async () => {
    prevEnv = process.env.NODE_ENV;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonePeService,
        { provide: ConfigService, useValue: { get: jest.fn(() => undefined) } },
      ],
    }).compile();

    service = module.get<PhonePeService>(PhonePeService);
  });

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
  });

  it('is unconfigured in this fixture', () => {
    expect(service.isConfigured).toBe(false);
  });

  // ─── Production: fail closed ─────────────────────────────────────────────

  describe('when NODE_ENV=production and PhonePe is not configured', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('initiatePayment rejects instead of returning a mock redirect', async () => {
      await expect(
        service.initiatePayment({
          amount: 10000,
          merchantTransactionId: 'TX1',
          redirectUrl: 'http://localhost/redirect',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.initiatePayment({
          amount: 10000,
          merchantTransactionId: 'TX1',
          redirectUrl: 'http://localhost/redirect',
        }),
      ).rejects.toMatchObject({ response: { code: 'PHONEPE_NOT_CONFIGURED' } });
    });

    it('checkPaymentStatus rejects instead of fabricating COMPLETED', async () => {
      await expect(service.checkPaymentStatus('TX1')).rejects.toThrow(BadRequestException);
      await expect(service.checkPaymentStatus('TX1')).rejects.toMatchObject({
        response: { code: 'PHONEPE_NOT_CONFIGURED' },
      });
    });

    it('processCallback rejects an unverifiable webhook', async () => {
      await expect(
        service.processCallback('{"response":"abc"}', 'sig'),
      ).rejects.toMatchObject({ response: { code: 'PHONEPE_NOT_CONFIGURED' } });
    });

    it('refundPayment rejects instead of faking a refund', async () => {
      await expect(
        service.refundPayment({ originalTransactionId: 'TX1' }),
      ).rejects.toMatchObject({ response: { code: 'PHONEPE_NOT_CONFIGURED' } });
    });
  });

  // ─── Development: mocks preserved ────────────────────────────────────────

  describe('when NODE_ENV=development and PhonePe is not configured', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('initiatePayment returns the dev mock redirect URL', async () => {
      const result = await service.initiatePayment({
        amount: 10000,
        merchantTransactionId: 'TX1',
        redirectUrl: 'http://localhost/redirect',
      });

      expect(result.merchantTransactionId).toBe('TX1');
      expect(result.redirectUrl).toContain('payment-mock');
    });

    it('checkPaymentStatus returns the dev mock COMPLETED state', async () => {
      const result = await service.checkPaymentStatus('TX1');

      expect(result?.state).toBe('COMPLETED');
      expect(result?.merchantTransactionId).toBe('TX1');
    });

    it('processCallback returns the dev mock completion', async () => {
      const result = await service.processCallback('{}', 'sig');

      expect(result.status).toBe('completed');
    });

    it('refundPayment returns the dev mock refund', async () => {
      const result = await service.refundPayment({ originalTransactionId: 'TX1' });

      expect(result.refundId).toContain('mock_refund_');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
