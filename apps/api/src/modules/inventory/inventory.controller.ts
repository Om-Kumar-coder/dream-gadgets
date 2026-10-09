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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
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
import { BranchScopeGuard } from '../../common/guards/branch-scope.guard';
import { BranchScoped } from '../../common/decorators/branch-scoped.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, BranchScopeGuard)
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

  @Get('brands')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'List all brands' })
  async getBrands() {
    return this.inventoryService.getBrands();
  }

  @Get('models')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'List models, optionally filtered by brandId' })
  async getModels(@Query('brandId') brandId?: string) {
    return this.inventoryService.getModels(brandId);
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
  async findByImei(@Param('imei') imei: string, @CurrentUser() user: any) {
    return this.inventoryService.findByImei(imei, user);
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  @Get('low-stock')
  @RequirePermission('inventory.view')
  @BranchScoped()
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'Get low stock alerts — models with few available items' })
  async getLowStock(@Query('threshold') threshold?: string) {
    const limit = threshold ? parseInt(threshold, 10) : 3;
    return this.inventoryService.getLowStockAlerts(limit);
  }

  @Get()
  @RequirePermission('inventory.view')
  @BranchScoped()
  @UseInterceptors(BranchFilterInterceptor)
  @ApiOperation({ summary: 'List inventory items (paginated, filtered)' })
  async findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Post()
  @RequirePermission('inventory.create')
  @BranchScoped()
  @ApiOperation({ summary: 'Create a new inventory item (purchase entry)' })
  async create(@Body() dto: CreateInventoryItemDto, @CurrentUser() user: any) {
    return this.inventoryService.create(dto, user.sub);
  }

  @Get(':id')
  @RequirePermission('inventory.view')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.inventoryService.findById(id, user);
  }

  @Patch(':id')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Update inventory item' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.update(id, dto, user.sub, user);
  }

  @Patch(':id/selling-price')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Change selling price in place (no delete/recreate)' })
  async changeSellingPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { sellingPrice: number },
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.changeSellingPrice(id, body?.sellingPrice, user.sub, user);
  }

  @Delete(':id')
  @RequirePermission('inventory.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete (archive) an inventory unit' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.inventoryService.softDelete(id, user.sub, user);
  }

  // ─── Photos ─────────────────────────────────────────────────────────────────

  @Post(':id/photos')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Get presigned S3 URL and register photo' })
  async addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { filename: string; s3Key?: string; sortOrder?: number },
    @CurrentUser() user: any,
  ) {
    if (body.s3Key) {
      // Client already uploaded — just register the photo
      return this.inventoryService.addPhoto(id, body.s3Key, body.sortOrder ?? 0, user);
    }
    // Return presigned URL for client to upload
    return this.inventoryService.getPresignedUploadUrl(id, body.filename, user);
  }

  @Post(':id/photos/upload')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Upload a product photo (multipart) and register it' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(__dirname, '..', '..', '..', '..', 'uploads', 'inventory');
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        // Accept a photo when EITHER its extension or its MIME type identifies
        // it as an image. Requiring both rejected valid uploads: browsers/OSes
        // sometimes send a generic/empty MIME type (e.g. application/octet-stream)
        // for a perfectly good .jpg, which previously surfaced as a 500 on save.
        const ext = extname(file.originalname).toLowerCase();
        const extOk = /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|tiff?)$/.test(ext);
        const mimeOk = /^image\//i.test(file.mimetype || '');
        if (extOk || mimeOk) return cb(null, true);
        cb(new BadRequestException(`Unsupported image type: ${file.mimetype || ext || 'unknown'}`), false);
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: { filename: string },
    @Body() body: { sortOrder?: string },
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException({ code: 'PHOTO_REQUIRED', message: 'Photo file is required' });
    }
    // Static assets are served at /api/v1/uploads — store a root-relative URL
    // that the web/admin clients prefix with the API base URL.
    const publicUrl = `/uploads/inventory/${file.filename}`;
    const s3Key = `inventory/${id}/${file.filename}`;
    const photo = await this.inventoryService.addPhoto(
      id,
      s3Key,
      body?.sortOrder ? parseInt(body.sortOrder, 10) : 0,
      user,
      publicUrl,
    );
    return { status: 'success', data: photo };
  }

  @Delete(':id/photos/:photoId')
  @RequirePermission('inventory.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a photo from an inventory item' })
  async deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @CurrentUser() user: any,
  ) {
    await this.inventoryService.deletePhoto(id, photoId, user);
  }

  // ─── Toggle online ──────────────────────────────────────────────────────────

  @Patch(':id/toggle-online')
  @RequirePermission('inventory.edit')
  @ApiOperation({ summary: 'Toggle isOnline flag and enqueue search index sync' })
  async toggleOnline(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.inventoryService.toggleOnline(id, user.sub, user);
  }
}
