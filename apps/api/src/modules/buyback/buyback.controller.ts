import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { BuybackService } from './buyback.service';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

class CreateBuybackLeadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  modelName: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;
}

class UpdateBuybackLeadDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@ApiTags('Buyback')
@Controller()
export class BuybackController {
  constructor(private readonly buybackService: BuybackService) {}

  // ─── Public: Submit a buyback lead ────────────────────────────────────────────

  @Post('public/buyback/leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a buyback/sell lead (public)' })
  async create(@Body() dto: CreateBuybackLeadDto) {
    if (!dto.brand?.trim() || !dto.modelName?.trim() || !dto.phone?.trim()) {
      throw new BadRequestException({
        code: 'INVALID_LEAD_DATA',
        message: 'Brand, model name, and phone are required',
      });
    }

    const lead = await this.buybackService.create(dto);
    return {
      data: {
        id: lead.id,
        message: 'Your request has been submitted. Our team will contact you shortly.',
      },
    };
  }

  // ─── Admin: List leads ────────────────────────────────────────────────────────

  @Get('buyback/leads')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('buyback.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List buyback leads (admin)' })
  async findAll(@Query() query: { page?: string; limit?: string; status?: string }) {
    return this.buybackService.findAll({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status,
    });
  }

  // ─── Admin: Get lead by ID ────────────────────────────────────────────────────

  @Get('buyback/leads/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('buyback.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get buyback lead by ID (admin)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const lead = await this.buybackService.findById(id);
    if (!lead) {
      throw new BadRequestException({ code: 'LEAD_NOT_FOUND', message: 'Lead not found' });
    }
    return { data: lead };
  }

  // ─── Admin: Update lead status ────────────────────────────────────────────────

  @Patch('buyback/leads/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('buyback.edit')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update buyback lead status (admin)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBuybackLeadDto,
  ) {
    const lead = await this.buybackService.updateStatus(id, dto.status, dto.notes);
    if (!lead) {
      throw new BadRequestException({ code: 'LEAD_NOT_FOUND', message: 'Lead not found' });
    }
    return { data: lead };
  }
}
