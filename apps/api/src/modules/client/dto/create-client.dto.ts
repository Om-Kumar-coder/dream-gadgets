import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty() @IsString() @IsNotEmpty() firstName: string;
  @ApiProperty() @IsString() @IsNotEmpty() lastName: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() district?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idProofType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idProofNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['walk-in', 'online', 'corporate', 'dealer']) customerType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() birthdayOffer?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty() @IsString() @IsNotEmpty() branchId: string;
}
