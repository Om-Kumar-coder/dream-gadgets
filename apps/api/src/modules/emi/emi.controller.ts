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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { EmiService } from './emi.service';
import { CreateEmiProviderDto, UpdateEmiProviderDto } from './dto/create-emi-provider.dto';
import { CreateEmiPlanDto, UpdateEmiPlanDto, CalculateEmiDto } from './dto/create-emi-plan.dto';

@ApiTags('EMI')
@Controller()
export class EmiController {
  constructor(private readonly emiService: EmiService) {}

  // ─── Public: Get eligible plans ────────────────────────────────────────

  @Get('public/emi/plans')
  @ApiOperation({ summary: 'Get eligible EMI plans for a given amount' })
  async getEligiblePlans(
    @Query('amount') amount?: string,
    @Query('provider') providerSlug?: string,
  ) {
    const numAmount = amount ? Number(amount) : undefined;
    const plans = await this.emiService.getEligiblePlans(numAmount, providerSlug);
    return { data: plans };
  }

  @Post('public/emi/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate EMI for given principal, tenure, and rate' })
  async calculateEmi(@Body() dto: CalculateEmiDto) {
    const result = await this.emiService.calculate({
      principal: dto.principal,
      tenureMonths: dto.tenureMonths,
      annualRate: dto.annualRate,
      processingFee: dto.processingFee,
    });
    return { data: result };
  }

  // ─── Admin: Providers ──────────────────────────────────────────────────

  @Get('admin/emi/providers')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all EMI providers' })
  async getProviders() {
    const providers = await this.emiService.getProviders();
    return { data: providers };
  }

  @Get('admin/emi/providers/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get EMI provider by ID' })
  async getProvider(@Param('id', ParseUUIDPipe) id: string) {
    const provider = await this.emiService.getProviderById(id);
    return { data: provider };
  }

  @Post('admin/emi/providers')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new EMI provider' })
  async createProvider(@Body() dto: CreateEmiProviderDto) {
    const provider = await this.emiService.createProvider(dto);
    return { data: provider };
  }

  @Patch('admin/emi/providers/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.edit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an EMI provider' })
  async updateProvider(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmiProviderDto,
  ) {
    const provider = await this.emiService.updateProvider(id, dto);
    return { data: provider };
  }

  @Delete('admin/emi/providers/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.delete')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an EMI provider' })
  async deleteProvider(@Param('id', ParseUUIDPipe) id: string) {
    await this.emiService.deleteProvider(id);
  }

  // ─── Admin: Plans ──────────────────────────────────────────────────────

  @Get('admin/emi/plans')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all EMI plans' })
  async getPlans(@Query('providerId') providerId?: string) {
    const plans = await this.emiService.getPlans(providerId);
    return { data: plans };
  }

  @Get('admin/emi/plans/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get EMI plan by ID' })
  async getPlan(@Param('id', ParseUUIDPipe) id: string) {
    const plan = await this.emiService.getPlanById(id);
    return { data: plan };
  }

  @Post('admin/emi/plans')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new EMI plan' })
  async createPlan(@Body() dto: CreateEmiPlanDto) {
    const plan = await this.emiService.createPlan(dto);
    return { data: plan };
  }

  @Patch('admin/emi/plans/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.edit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an EMI plan' })
  async updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmiPlanDto,
  ) {
    const plan = await this.emiService.updatePlan(id, dto);
    return { data: plan };
  }

  @Delete('admin/emi/plans/:id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermission('emi.delete')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an EMI plan' })
  async deletePlan(@Param('id', ParseUUIDPipe) id: string) {
    await this.emiService.deletePlan(id);
  }
}
