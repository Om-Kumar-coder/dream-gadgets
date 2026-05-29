import { Controller, Get, HttpCode, ServiceUnavailableException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  services: {
    api: { status: 'ok'; version: string };
    database: { status: 'ok' | 'down'; latencyMs?: number; error?: string };
    redis: { status: 'ok' | 'down'; latencyMs?: number; error?: string };
    memory: {
      status: 'ok' | 'warn';
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
    };
  };
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const result: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        api: { status: 'ok', version: this.configService.get('app.env', 'development') },
        database: { status: 'ok' },
        redis: { status: 'ok' },
        memory: {
          status: 'ok',
          heapUsedMb: 0,
          heapTotalMb: 0,
          rssMb: 0,
        },
      },
    };

    // Check database connectivity
    try {
      const dbStart = Date.now();
      await this.dataSource.query('SELECT 1');
      result.services.database.latencyMs = Date.now() - dbStart;
    } catch (err) {
      result.status = 'degraded';
      result.services.database.status = 'down';
      result.services.database.error = err instanceof Error ? err.message : 'Unknown DB error';
      this.logger.error(`Health check: Database down - ${result.services.database.error}`);
    }

    // Check Redis connectivity using ioredis (used by BullMQ/CacheModule)
    try {
      const redisUrl = this.configService.get<string>('redis.url');
      if (redisUrl && redisUrl.startsWith('redis://')) {
        const redisStart = Date.now();
        const Redis = await import('ioredis').then(m => m.default || m);
        const client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: () => null,
        });
        await client.connect();
        await client.ping();
        result.services.redis.latencyMs = Date.now() - redisStart;
        await client.quit();
      }
    } catch (err) {
      // Redis might not be configured — mark degraded but don't fail
      result.services.redis.status = 'down';
      result.services.redis.error = err instanceof Error ? err.message : 'Unknown Redis error';
      this.logger.warn(`Health check: Redis unavailable - ${result.services.redis.error}`);
    }

    // Memory usage
    const mem = process.memoryUsage();
    result.services.memory = {
      status: mem.heapUsed / mem.heapTotal > 0.85 ? 'warn' : 'ok',
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
    };
    if (result.services.memory.status === 'warn') {
      result.status = 'degraded';
      this.logger.warn(`Health check: High memory usage - ${result.services.memory.heapUsedMb}MB / ${result.services.memory.heapTotalMb}MB`);
    }

    return result;
  }

  @Get('live')
  @HttpCode(200)
  liveness(): { status: string } {
    return { status: 'alive' };
  }

  @Get('ready')
  async readiness(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ready', database: 'connected' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database is not connected',
        },
      });
    }
  }
}
