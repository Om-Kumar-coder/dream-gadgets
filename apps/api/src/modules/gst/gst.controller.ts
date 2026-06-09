import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GstService } from './gst.service';

@ApiTags('GST Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('gst')
export class GstController {
  constructor(private readonly gstService: GstService) {}

  @Get('gstr1')
  @ApiOperation({ summary: 'Generate GSTR-1 data (B2B, B2CL, B2CS, CDNR)' })
  @ApiQuery({ name: 'from', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'branchId', required: false })
  async getGstr1(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('branchId') branchId?: string,
  ) {
    const [data, summary] = await Promise.all([
      this.gstService.generateGstr1(from, to, branchId),
      this.gstService.generateSummary(from, to, branchId),
    ]);

    return { status: 'success', data, summary };
  }

  @Get('gstr1/export')
  @ApiOperation({ summary: 'Export GSTR-1 as Excel file' })
  @ApiQuery({ name: 'from', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2025-01-31' })
  @ApiQuery({ name: 'branchId', required: false })
  async exportGstr1(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
    @Query('branchId') branchId?: string,
  ): Promise<void> {
    const buffer = await this.gstService.generateExcel(from, to, branchId);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="gstr1-${from}-to-${to}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
