import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { getTemplate, getTemplateKeys } from './templates';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermission('notifications.view')
  @ApiOperation({ summary: 'List all notifications with filtering' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('userId') userId?: string,
  ) {
    return this.notificationService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      channel,
      userId,
    });
  }

  @Get('failed')
  @RequirePermission('notifications.view')
  @ApiOperation({ summary: 'Get all failed notifications' })
  async getFailed() {
    const notifications = await this.notificationService.getFailedNotifications();
    return { data: notifications, total: notifications.length };
  }

  @Post(':id/retry')
  @RequirePermission('notifications.retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed notification' })
  async retry(@Param('id') id: string) {
    const notification = await this.notificationService.retryFailed(id);
    return { message: 'Notification requeued for retry', data: notification };
  }

  @Post('retry-all')
  @RequirePermission('notifications.retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry all failed notifications' })
  async retryAll() {
    const result = await this.notificationService.retryAllFailed();
    return { message: `Retried ${result.retried} notifications`, data: result };
  }

  // ─── Template management ───────────────────────────────────────────────────

  @Get('templates')
  @RequirePermission('notifications.view')
  @ApiOperation({ summary: 'List all notification template keys' })
  listTemplates() {
    const keys = getTemplateKeys();
    return { data: keys.map(key => ({ key, ...getTemplate(key) })) };
  }

  @Get('templates/:key')
  @RequirePermission('notifications.view')
  @ApiOperation({ summary: 'Get a single template by key' })
  getTemplate(@Param('key') key: string) {
    const tpl = getTemplate(key);
    if (!tpl) return { status: 'error', message: `Template '${key}' not found` };
    return { data: { key, ...tpl } };
  }

  @Post('templates/:key/preview')
  @RequirePermission('notifications.view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview a template with sample variables' })
  async previewTemplate(
    @Param('key') key: string,
    @Body() body: { vars?: Record<string, string> },
  ) {
    const result = await this.notificationService.resolveTemplate(key, body.vars ?? {});
    return { data: result };
  }
}
