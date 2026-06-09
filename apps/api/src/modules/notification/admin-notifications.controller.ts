import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get all failed notifications' })
  async getFailed() {
    const notifications = await this.notificationService.getFailedNotifications();
    return { data: notifications, total: notifications.length };
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed notification' })
  async retry(@Param('id') id: string) {
    const notification = await this.notificationService.retryFailed(id);
    return { message: 'Notification requeued for retry', data: notification };
  }

  @Post('retry-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry all failed notifications' })
  async retryAll() {
    const result = await this.notificationService.retryAllFailed();
    return { message: `Retried ${result.retried} notifications`, data: result };
  }
}
