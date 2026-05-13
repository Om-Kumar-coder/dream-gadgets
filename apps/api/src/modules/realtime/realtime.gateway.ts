import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: any;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly configService: ConfigService,
  ) {}

  // ─── 17.1 Gateway init ────────────────────────────────────────────────────────

  afterInit(server: any): void {
    this.realtimeService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  // ─── 17.1 JWT authentication on connection ────────────────────────────────────

  async handleConnection(client: any): Promise<void> {
    try {
      const token =
        client.handshake?.auth?.token ??
        client.handshake?.query?.token;

      if (!token) {
        this.logger.warn(`[WS] Connection rejected — no token: ${client.id}`);
        client.disconnect(true);
        return;
      }

      const payload = this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`[WS] Connection rejected — invalid token: ${client.id}`);
        client.disconnect(true);
        return;
      }

      // Attach user info to socket
      client.data = { userId: payload.sub, branchId: payload.branchId, role: payload.role };

      // ─── 17.2 Room assignment ─────────────────────────────────────────────────
      await client.join(`user:${payload.sub}`);

      if (payload.branchId) {
        await client.join(`branch:${payload.branchId}`);
      }

      // Owners join admin room
      if (!payload.branchId || payload.role === 'Shop Owner') {
        await client.join('admin');
      }

      this.logger.log(`[WS] Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (err: any) {
      this.logger.warn(`[WS] Connection error: ${err?.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: any): void {
    this.logger.log(`[WS] Client disconnected: ${client.id}`);
  }

  // ─── Token verification ───────────────────────────────────────────────────────

  private verifyToken(token: string): any {
    try {
      const jwt = require('jsonwebtoken');
      const secret = this.configService.get<string>('app.jwtSecret') ?? this.configService.get<string>('JWT_SECRET') ?? 'dev-secret';
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }

  // ─── 17.3 / 17.4 Client-side event handlers ──────────────────────────────────

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: any): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('join-branch')
  async handleJoinBranch(
    @ConnectedSocket() client: any,
    @MessageBody() data: { branchId: string },
  ): Promise<void> {
    if (client.data?.branchId === data.branchId || !client.data?.branchId) {
      await client.join(`branch:${data.branchId}`);
      client.emit('joined', { room: `branch:${data.branchId}` });
    }
  }
}
