import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAppointmentService } from './whatsapp-appointment.service';
import { NotificationService } from '../notification/notification.service';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly whatsappTemplateService: WhatsappTemplateService,
    private readonly whatsappAppointmentService: WhatsappAppointmentService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Conversations ───────────────────────────────────────────────────────

  @Get('conversations')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List WhatsApp conversations' })
  async getConversations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.whatsappService.getConversations({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
      search,
    });
  }

  @Get('conversations/:id')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get conversation with messages' })
  async getConversation(@Param('id', ParseUUIDPipe) id: string) {
    return this.whatsappService.getConversationById(id);
  }

  @Get('conversations/:id/messages')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.whatsappService.getMessages(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Patch('conversations/:id')
  @RequirePermission('whatsapp.edit')
  @ApiOperation({ summary: 'Update conversation details (status, type, assignee, priority, tags)' })
  async updateConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: {
      customerName?: string;
      type?: string;
      status?: string;
      assignedStaffId?: string;
      priority?: string;
      tags?: object;
    },
  ) {
    return this.whatsappService.updateConversation(id, dto);
  }

  // ─── Send message ────────────────────────────────────────────────────────

  @Post('send')
  @RequirePermission('whatsapp.send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a WhatsApp message to a phone number' })
  async sendMessage(
    @Body() dto: { to: string; content: string; conversationId?: string },
    @CurrentUser() user: any,
  ) {
    // Use notification system to send the WhatsApp message
    const notification = await this.notificationService.sendWhatsApp({
      to: dto.to,
      type: 'agent_message',
      body: dto.content,
      metadata: {
        sentBy: user.sub,
        conversationId: dto.conversationId,
      },
    });

    // If a conversationId was provided, also store the message locally
    if (dto.conversationId) {
      await this.whatsappService.storeMessage({
        conversationId: dto.conversationId,
        direction: 'outbound',
        fromNumber: 'system',
        toNumber: dto.to,
        content: dto.content,
        providerMessageId: notification.providerMessageId ?? undefined,
        metadata: { sentBy: user.sub },
      });
    }

    return { status: 'sent', notificationId: notification.id };
  }

  // ─── Stats ───────────────────────────────────────────────────────────────

  @Get('stats')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get WhatsApp conversation stats' })
  async getStats() {
    const [activeCount, unreadCount] = await Promise.all([
      this.whatsappService.getConversationCount('active'),
      this.whatsappService.getUnreadCount(),
    ]);

    return {
      activeConversations: activeCount,
      unreadCount,
    };
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  @Get('templates')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List WhatsApp templates' })
  async getTemplates(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.whatsappTemplateService.getTemplates({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      category,
      status,
      search,
    });
  }

  @Get('templates/:id')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.whatsappTemplateService.getTemplateById(id);
  }

  @Post('templates')
  @RequirePermission('whatsapp.create')
  @ApiOperation({ summary: 'Create a WhatsApp template' })
  async createTemplate(@Body() dto: any) {
    return this.whatsappTemplateService.createTemplate(dto);
  }

  @Patch('templates/:id')
  @RequirePermission('whatsapp.edit')
  @ApiOperation({ summary: 'Update a WhatsApp template' })
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.whatsappTemplateService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @RequirePermission('whatsapp.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a WhatsApp template' })
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string) {
    await this.whatsappTemplateService.deleteTemplate(id);
  }

  // ─── Campaigns ────────────────────────────────────────────────────────────

  @Get('campaigns')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List WhatsApp campaigns' })
  async getCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.whatsappTemplateService.getCampaigns({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
      search,
    });
  }

  @Get('campaigns/:id')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async getCampaign(@Param('id', ParseUUIDPipe) id: string) {
    return this.whatsappTemplateService.getCampaignById(id);
  }

  @Post('campaigns')
  @RequirePermission('whatsapp.create')
  @ApiOperation({ summary: 'Create a WhatsApp campaign' })
  async createCampaign(@Body() dto: any) {
    return this.whatsappTemplateService.createCampaign(dto);
  }

  @Patch('campaigns/:id')
  @RequirePermission('whatsapp.edit')
  @ApiOperation({ summary: 'Update a WhatsApp campaign' })
  async updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.whatsappTemplateService.updateCampaign(id, dto);
  }

  @Delete('campaigns/:id')
  @RequirePermission('whatsapp.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a WhatsApp campaign' })
  async deleteCampaign(@Param('id', ParseUUIDPipe) id: string) {
    await this.whatsappTemplateService.deleteCampaign(id);
  }

  @Post('campaigns/:id/launch')
  @RequirePermission('whatsapp.edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Launch a WhatsApp campaign' })
  async launchCampaign(@Param('id', ParseUUIDPipe) id: string) {
    return this.whatsappTemplateService.launchCampaign(id);
  }

  @Get('campaigns/:id/stats')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'Get campaign analytics stats' })
  async getCampaignStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.whatsappTemplateService.getCampaignStats(id);
  }

  // ─── Appointments ─────────────────────────────────────────────────────────

  @Get('appointments')
  @RequirePermission('whatsapp.view')
  @ApiOperation({ summary: 'List WhatsApp appointments' })
  async getAppointments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('phone') phone?: string,
  ) {
    return this.whatsappAppointmentService.getAppointments({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
      phone,
    });
  }

  @Post('appointments')
  @RequirePermission('whatsapp.create')
  @ApiOperation({ summary: 'Create a WhatsApp appointment' })
  async createAppointment(@Body() dto: any) {
    return this.whatsappAppointmentService.create(dto);
  }

  @Patch('appointments/:id')
  @RequirePermission('whatsapp.edit')
  @ApiOperation({ summary: 'Update appointment status' })
  async updateAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string },
  ) {
    return this.whatsappAppointmentService.updateStatus(id, dto.status);
  }
}
