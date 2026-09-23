import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, Matches, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const INDIAN_PINCODE = /^[1-9]\d{5}$/;

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(INDIAN_MOBILE, { message: 'Enter a valid 10-digit Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: '221B Baker Street' })
  @IsString()
  @IsNotEmpty({ message: 'Address line 1 is required' })
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apartment 4B' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Near Park Street metro' })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  landmark?: string;

  @ApiProperty({ example: 'Kolkata' })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'West Bengal' })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '700001' })
  @IsString()
  @Matches(INDIAN_PINCODE, { message: 'Enter a valid 6-digit Indian pincode' })
  pincode: string;

  @ApiProperty({ enum: ['home', 'work', 'other'] })
  @IsIn(['home', 'work', 'other'], { message: 'Address type must be home, work or other' })
  addressType: 'home' | 'work' | 'other';

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullName?: string;

  @IsString()
  @IsOptional()
  @Matches(INDIAN_MOBILE, { message: 'Enter a valid 10-digit Indian mobile number' })
  mobile?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine1?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  landmark?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @Matches(INDIAN_PINCODE, { message: 'Enter a valid 6-digit Indian pincode' })
  pincode?: string;

  @IsIn(['home', 'work', 'other'], { message: 'Address type must be home, work or other' })
  @IsOptional()
  addressType?: 'home' | 'work' | 'other';

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
