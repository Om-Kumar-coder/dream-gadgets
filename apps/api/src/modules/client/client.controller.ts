import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @RequirePermission('clients.create')
  @ApiOperation({ summary: 'Create a new client' })
  async create(@Body() dto: CreateClientDto, @CurrentUser() user: any) {
    return this.clientService.create(dto, user.sub);
  }

  @Get()
  @RequirePermission('clients.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List clients with optional search/filters' })
  async findAll(@Query() query: QueryClientDto) {
    return this.clientService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('clients.view')
  @ApiOperation({ summary: 'Get client by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.findById(id);
  }

  @Patch(':id')
  @RequirePermission('clients.edit')
  @ApiOperation({ summary: 'Update client details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientService.update(id, dto);
  }

  @Get(':id/history')
  @RequirePermission('clients.view')
  @ApiOperation({ summary: 'Get client transaction history (purchases, sales, exchanges, returns)' })
  async getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.getHistory(id);
  }

  @Post(':id/ekyc')
  @RequirePermission('clients.edit')
  @ApiOperation({ summary: 'Upload EKYC documents for a client' })
  async uploadEkyc(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { documents: object },
  ) {
    return this.clientService.uploadEkycDocuments(id, body.documents);
  }

  @Patch(':id/ekyc/verify')
  @RequirePermission('clients.edit')
  @ApiOperation({ summary: 'Verify client EKYC' })
  async verifyEkyc(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.clientService.verifyEkyc(id, user.sub);
  }

  @Post(':id/send-email')
  @RequirePermission('clients.view')
  @ApiOperation({ summary: 'Send email to client' })
  async sendEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { subject: string; body: string },
  ) {
    return this.clientService.sendEmail(id, body);
  }

  @Post(':id/send-whatsapp')
  @RequirePermission('clients.view')
  @ApiOperation({ summary: 'Send WhatsApp message to client' })
  async sendWhatsapp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { message: string },
  ) {
    return this.clientService.sendWhatsapp(id, body);
  }
}
