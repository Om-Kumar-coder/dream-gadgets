import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('HTTP');
    // Trust proxy — Nginx reverse proxy in production
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    // Serve uploaded static files (prefix with /api/v1 so it works behind Nginx proxy)
    // Uploads are stored at apps/uploads/ (monorepo level, not apps/api/uploads/)
    const uploadsPath = join(__dirname, '..', '..', 'uploads');
    app.useStaticAssets(uploadsPath, { prefix: '/api/v1/uploads' });
    // Security
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(compression());
    app.enableCors({
        origin: [process.env.WEB_URL || 'http://localhost:3001', process.env.ADMIN_URL || 'http://localhost:3002'],
        credentials: true,
    });
    // Parse URL-encoded bodies for Twilio WhatsApp webhooks
    app.use('/api/v1/public/whatsapp/webhook', (req, _res, next) => {
        if (req.method === 'POST' && req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => {
                const params = new URLSearchParams(data);
                req.body = {};
                for (const [key, value] of params.entries()) {
                    req.body[key] = value;
                }
                next();
            });
        }
        else {
            next();
        }
    });
    // Request logging middleware (structured JSON in production)
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const user = req.user;
            const role = user?.role ?? 'anonymous';
            const userId = user?.sub ?? '-';
            const logEntry = {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                durationMs: duration,
                userId,
                role,
                userAgent: req.headers['user-agent'] || '',
                ip: req.ip,
            };
            if (process.env.NODE_ENV === 'production') {
                logger.log(JSON.stringify(logEntry));
            }
            else {
                logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms | user=${userId} role=${role}`);
            }
        });
        next();
    });
    // Global prefix
    app.setGlobalPrefix('api/v1');
    // Global exception filter (ensures all errors return proper JSON)
    app.useGlobalFilters(new AllExceptionsFilter());
    // Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false, // allow extra query params (search, sort, filters from DataTable)
        transform: true,
    }));
    // Global response transform
    app.useGlobalInterceptors(new TransformInterceptor());
    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Dream Gadgets API')
        .setDescription('Multi-branch mobile store management platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Dream Gadgets API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map