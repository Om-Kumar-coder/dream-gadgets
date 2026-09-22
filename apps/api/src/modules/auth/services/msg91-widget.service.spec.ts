import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Msg91WidgetService } from './msg91-widget.service';

describe('Msg91WidgetService', () => {
  let service: Msg91WidgetService;
  let configMock: Record<string, string>;

  function makeConfigService(env: Record<string, string>): any {
    return { get: jest.fn((key: string) => env[key]) };
  }

  function mockFetchOnce(payload: unknown, status = 200) {
    (global as any).fetch = jest.fn(async () =>
      ({
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(payload),
      }) as any,
    );
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    configMock = makeConfigService({ MSG91_WIDGET_AUTH_KEY: 'test-widget-authkey' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [Msg91WidgetService, { provide: ConfigService, useValue: configMock }],
    }).compile();
    service = module.get<Msg91WidgetService>(Msg91WidgetService);
  });

  it('should exchange the access token and return the verified phone', async () => {
    mockFetchOnce({ type: 'success', message: '919876543210 verified' });

    const result = await service.verifyAccessToken('jwt-token');

    expect(result.success).toBe(true);
    expect(result.phone).toBe('919876543210');
    const [url, init] = ((global as any).fetch as jest.Mock).mock.calls[0] as [string, any];
    expect(url).toBe('https://control.msg91.com/api/v5/widget/verifyAccessToken');
    expect(JSON.parse(init.body)).toEqual({
      authkey: 'test-widget-authkey',
      'access-token': 'jwt-token',
    });
  });

  it('should accept an E.164 formatted identifier with spaces and punctuation', async () => {
    mockFetchOnce({ type: 'success', message: '+91 98765 43210 verified successfully' });

    const result = await service.verifyAccessToken('jwt-token');

    expect(result.success).toBe(true);
    expect(result.phone).toBe('919876543210');
  });

  it('should return the verified email when the identifier is an email', async () => {
    mockFetchOnce({ type: 'success', message: 'user@example.com verified' });

    const result = await service.verifyAccessToken('jwt-token');

    expect(result.success).toBe(true);
    expect(result.email).toBe('user@example.com');
    expect(result.phone).toBeUndefined();
  });

  it('should fail when MSG91 rejects the token', async () => {
    mockFetchOnce({ type: 'error', message: 'Token expired' });

    const result = await service.verifyAccessToken('stale-token');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Token expired');
  });

  it('should fail on HTTP errors', async () => {
    mockFetchOnce({ message: 'unauthorized' }, 401);

    const result = await service.verifyAccessToken('jwt-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('401');
  });

  it('should fail when no authkey is configured', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Msg91WidgetService,
        { provide: ConfigService, useValue: makeConfigService({}) },
      ],
    }).compile();
    const unconfigured = module.get<Msg91WidgetService>(Msg91WidgetService);

    const result = await unconfigured.verifyAccessToken('jwt-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('should fail when the response contains no recognizable identifier', async () => {
    mockFetchOnce({ type: 'success', message: 'all good' });

    const result = await service.verifyAccessToken('jwt-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('contact details');
  });
});
