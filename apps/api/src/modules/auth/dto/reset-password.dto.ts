import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email or phone number' })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({ required: false, description: 'New email address' })
  @IsString()
  @IsNotEmpty()
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
