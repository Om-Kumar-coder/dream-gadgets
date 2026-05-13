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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchFilterInterceptor } from '../../common/interceptors/branch-filter.interceptor';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ─── Static routes first (before :id) ───────────────────────────────────────

  @Get('price-suggestion')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get median historical sale price for model+condition' })
  async getPriceSuggestion(
    @Query('modelId') modelId: string,
    @Query('condition') condition: string,
  ) {
    return this.inventoryService.getPriceSuggestion(modelId, condition);
  }

  @Get('city-stock')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get branch availability counts for a model' })
  async getCityStock(@Query('modelId') modelId: string) {
    return this.inventoryService.getCityStock(modelId);
  }

  @Post('bulk-import')
  @RequirePermission('inventory.create')
  @ApiOperation({ summary: 'Bulk import inventory items from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async bulkImport(@UploadedFile() file: { buffer: Buffer }, @CurrentUser() user: any) {
    return this.inventoryService.bulkImport(file.buffer, user.sub);
  }

  // ─── IMEI lookup ────────────────────────────────────────────────────────────

  @Get('imei/:imei')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Find inventory item by IMEI' })
  async findByImei(@Param('imei') imei: string) {
    return this.inventoryService.findByImei(imei);
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  @Get()
  @RequirePermission('inventory.view')
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List inventory items (paginated, filtered)' })
  async findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Post()
  @RequirePermission('inventory.create')
  @ApiOperation({ summary: 'Create a new inventory item (purchase entry)' })
  async create(@Body() dto: CreateInventoryItemDto, @CurrentUser() user: any) {
    return this.inventoryService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findById(id);
  }

  @Patch(':id')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Update inventory item' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.update(id, dto, user.sub);
  }

  // ─── Photos ─────────────────────────────────────────────────────────────────

  @Post(':id/photos')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Get presigned S3 URL and register photo' })
  async addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { filename: string; s3Key?: string; sortOrder?: number },
  ) {
    if (body.s3Key) {
      // Client already uploaded — just register the photo
      return this.inventoryService.addPhoto(id, body.s3Key, body.sortOrder ?? 0);
    }
    // Return presigned URL for client to upload
    return this.inventoryService.getPresignedUploadUrl(id, body.filename);
  }

  @Delete(':id/photos/:photoId')
  @RequirePermission('inventory.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo from an inventory item' })
  async deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    await this.inventoryService.deletePhoto(id, photoId);
  }

  // ─── Toggle online ──────────────────────────────────────────────────────────

  @Patch(':id/toggle-online')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Toggle isOnline flag and enqueue search index sync' })
  async toggleOnline(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.inventoryService.toggleOnline(id, user.sub);
  }
}
