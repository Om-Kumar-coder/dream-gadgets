import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { WhatsappService } from './whatsapp.service';
import { TwilioWebhookGuard } from './guards/twilio-webhook.guard';

/**
 * Public webhook endpoints for WhatsApp Business API (Twilio/Meta).
 * - GET: Webhook verification challenge
 * - POST: Incoming messages and delivery receipts
 */
@ApiTags('WhatsApp Webhook')
@Controller('public/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Webhook verification challenge.
   * WhatsApp Business API / Twilio sends a GET request with a challenge token
   * during initial webhook setup. We must echo the challenge back.
   */
  @Get('webhook')
  @HttpCode(HttpStatus.OK)
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ): string {
    const result = this.whatsappService.verifyWebhook(mode, challenge, verifyToken);
    if (result) {
      return result;
    }
    // Return challenge as-is for Twilio-style verification
    if (challenge) {
      return challenge;
    }
    throw new Error('Webhook verification failed');
  }

  /**
   * Alternative verification format used by some providers.
   */
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  verifyEndpoint(
    @Query('hub_mode') mode: string,
    @Query('hub_challenge') challenge: string,
    @Query('hub_verify_token') verifyToken: string,
  ): string {
    return this.verifyWebhook(
      mode ?? (''),
      challenge ?? (''),
      verifyToken ?? (''),
    );
  }

  /**
   * Receive incoming messages and delivery status updates.
   * Supports both Twilio and Meta Cloud API payload formats.
   */
  @Post('webhook')
  @UseGuards(TwilioWebhookGuard)
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @HttpCode(HttpStatus.OK)
  async receiveMessage(@Body() payload: any): Promise<{ status: string }> {
    await this.whatsappService.handleIncoming(payload);
    return { status: 'ok' };
  }
}
