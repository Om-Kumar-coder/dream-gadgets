import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('Public')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('public/account/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  private userId(req: any): string {
    if (!req.user?.sub) {
      // AuthGuard('jwt') already rejects unauthenticated requests; this is a
      // defensive fallback so no handler ever runs without a user id.
      throw new Error('Not authenticated');
    }
    return req.user.sub;
  }

  @Get()
  @ApiOperation({ summary: "List the authenticated customer's saved addresses" })
  async list(@Request() req: any) {
    return { data: await this.addressService.list(this.userId(req)) };
  }

  @Get(':id')
  @ApiOperation({ summary: "Get one of the authenticated customer's addresses" })
  async get(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.addressService.get(this.userId(req), id) };
  }

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a saved address' })
  async create(@Request() req: any, @Body() dto: CreateAddressDto) {
    return { data: await this.addressService.create(this.userId(req), dto) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved address (fields optional)' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return { data: await this.addressService.update(this.userId(req), id, dto) };
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set an address as the default' })
  async setDefault(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.addressService.update(this.userId(req), id, { isDefault: true }) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved address' })
  async remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.addressService.remove(this.userId(req), id);
  }
}
