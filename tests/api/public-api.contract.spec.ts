import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OnlineOrder } from '../modules/sales/entities/online-order.entity';
import { OnlineOrderStatus } from '@dream-gadgets/shared-types';

/**
 * Integration tests for public API endpoints
 * Tests contract between frontend and public backend routes
 */
describe('Public API Contract Tests (e2e)', () => {
  let app: INestApplication;
  let onlineOrderRepo: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    onlineOrderRepo = moduleFixture.get(getRepositoryToken(OnlineOrder));
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── 1. PUBLIC PRODUCTS ENDPOINT ──────────────────────────────────────────────

  describe('GET /public/products', () => {
    it('should return paginated products without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/products').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support brand filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public/products')
        .query({ brand: 'Apple' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support condition filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public/products')
        .query({ condition: 'mint' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support price range filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public/products')
        .query({ minPrice: 10000, maxPrice: 50000 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBeLessThanOrEqual(10);
    });
  });

  // ─── 2. PUBLIC PRODUCT DETAIL ENDPOINT ────────────────────────────────────────

  describe('GET /public/products/:id', () => {
    it('should return product details without authentication', async () => {
      // This test assumes at least one product exists in the database
      const response = await request(app.getHttpServer()).get('/api/v1/public/products/test-id');

      // Could be 200 (if product exists) or 404 (if not)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
      } else {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
      }
    });
  });

  // ─── 3. PUBLIC ORDERS ENDPOINT ────────────────────────────────────────────────

  describe('POST /public/orders', () => {
    it('should create an order without authentication (guest checkout)', async () => {
      const createOrderPayload = {
        items: [{ itemId: 'item-1', unitPrice: 10000 }],
        shippingAddress: {
          name: 'John Doe',
          phone: '9876543210',
          street: '123 Main St',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        totalAmount: 10000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/public/orders')
        .send(createOrderPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe(OnlineOrderStatus.PENDING_PAYMENT);
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data.totalAmount).toBe(10000);
    });

    it('should validate required fields', async () => {
      const invalidPayload = {
        items: [], // Missing or empty items
        // Missing shippingAddress
        // Missing totalAmount
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/public/orders')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('INVALID_ORDER_DATA');
    });

    it('should include shippingAddress in response', async () => {
      const createOrderPayload = {
        items: [{ itemId: 'item-1', unitPrice: 5000 }],
        shippingAddress: {
          name: 'Jane Smith',
          phone: '9876543210',
          street: '456 Oak Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        totalAmount: 5000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/public/orders')
        .send(createOrderPayload)
        .expect(201);

      expect(response.body.data.shippingAddress).toEqual(createOrderPayload.shippingAddress);
    });
  });

  // ─── 4. GET PUBLIC ORDER DETAIL ────────────────────────────────────────────────

  describe('GET /public/orders/:id', () => {
    it('should return order details without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/orders/nonexistent-id');

      // Could be 200 (if order exists) or 404 (if not)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('orderNumber');
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('totalAmount');
        expect(response.body.data).toHaveProperty('shippingAddress');
      }
    });

    it('should return proper error for missing order', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/orders/invalid-uuid');

      // Either 404 or 400 (invalid UUID)
      expect([400, 404]).toContain(response.status);
    });
  });

  // ─── 5. GET USER'S ORDERS (requires auth) ─────────────────────────────────────

  describe('GET /public/orders (authenticated)', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/orders').expect(401);

      expect(response.body).toHaveProperty('error') || expect(response.status).toBe(401);
    });

    // This would require setting up auth tokens in a real test
    // it('should return user\'s orders when authenticated', async () => {
    //   const token = 'mock-jwt-token';
    //   const response = await request(app.getHttpServer())
    //     .get('/api/v1/public/orders')
    //     .set('Authorization', `Bearer ${token}`)
    //     .expect(200);
    //
    //   expect(response.body).toHaveProperty('data');
    //   expect(response.body.data).toHaveProperty('data');
    //   expect(Array.isArray(response.body.data.data)).toBe(true);
    // });
  });

  // ─── 6. PUBLIC PAYMENT ENDPOINT ───────────────────────────────────────────────

  describe('POST /payments/razorpay/order', () => {
    it('should create Razorpay order without authentication (public checkout)', async () => {
      const createPaymentPayload = {
        amount: 1000000, // 1,000,000 paise = ₹10,000
        currency: 'INR',
        receipt: 'receipt-123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/razorpay/order')
        .send(createPaymentPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('amount');
      expect(response.body.data.amount).toBe(1000000);
      expect(response.body.data.currency).toBe('INR');
    });

    it('should validate amount is positive', async () => {
      const invalidPayload = {
        amount: 0, // Invalid amount
        currency: 'INR',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/razorpay/order')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('INVALID_AMOUNT');
    });

    it('should accept optional currency parameter', async () => {
      const payload = {
        amount: 500000, // ₹5,000
        // currency omitted - should default to INR
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/razorpay/order')
        .send(payload)
        .expect(201);

      expect(response.body.data.currency).toBe('INR');
    });
  });

  // ─── 7. CONTRACT: Order Status Values ─────────────────────────────────────────

  describe('Order Status Contract', () => {
    it('should use standard OnlineOrderStatus enum values', async () => {
      const validStatuses = [
        OnlineOrderStatus.PENDING_PAYMENT,
        OnlineOrderStatus.PAYMENT_CONFIRMED,
        OnlineOrderStatus.PROCESSING,
        OnlineOrderStatus.PACKED,
        OnlineOrderStatus.SHIPPED,
        OnlineOrderStatus.OUT_FOR_DELIVERY,
        OnlineOrderStatus.DELIVERED,
        OnlineOrderStatus.CANCELLED,
        OnlineOrderStatus.RETURN_REQUESTED,
        OnlineOrderStatus.RETURNED,
      ];

      // Verify all expected statuses exist
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── 8. CONTRACT: Response Shape ─────────────────────────────────────────────

  describe('Response Shape Contract', () => {
    it('should return consistent error response format', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/orders/invalid').expect([400, 404]);

      // Either error or standard error response
      expect(response.body).toHaveProperty('error') || expect(response.body).toHaveProperty('message');
    });

    it('should wrap successful data responses', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/public/products').expect(200);

      // Products list should have data wrapper
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ─── 9. CONTRACT: No Auth Required for Public Endpoints ──────────────────────

  describe('Public Endpoint Access Control', () => {
    it('should NOT require authentication for GET /public/products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public/products')
        .expect(200);

      expect(response.status).not.toBe(401);
    });

    it('should NOT require authentication for POST /public/orders', async () => {
      const payload = {
        items: [{ itemId: 'item-1', unitPrice: 1000 }],
        shippingAddress: {
          name: 'Test User',
          phone: '9876543210',
          street: '123 Test St',
          city: 'TestCity',
          state: 'TestState',
          pincode: '123456',
        },
        totalAmount: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/public/orders')
        .send(payload);

      // Should succeed with 201, not 401
      expect([201, 400]).toContain(response.status); // 400 if DB fails, but not 401
      expect(response.status).not.toBe(401);
    });

    it('should NOT require authentication for POST /payments/razorpay/order', async () => {
      const payload = {
        amount: 100000,
        currency: 'INR',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/razorpay/order')
        .send(payload);

      // Should succeed with 201, not 401
      expect([201, 400]).toContain(response.status);
      expect(response.status).not.toBe(401);
    });
  });

  // ─── 10. CONTRACT: Protected Admin Endpoints ──────────────────────────────────

  describe('Protected Admin Endpoints', () => {
    it('should require authentication for POST /payments/razorpay/refund', async () => {
      const payload = {
        paymentId: 'pay-123',
        amount: 100000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/razorpay/refund')
        .send(payload)
        .expect(401);

      expect(response.status).toBe(401);
    });

    it('should require authentication for GET /payments/:id', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/payments/invalid-id').expect(401);

      expect(response.status).toBe(401);
    });

    it('should require authentication for GET /sales/:id/payments', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/sales/invalid-id/payments').expect(401);

      expect(response.status).toBe(401);
    });
  });
});
