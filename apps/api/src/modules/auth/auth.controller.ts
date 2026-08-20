import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto, ChangePasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@dream-gadgets/shared-types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 3.2 Login
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/phone + password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 3.3 Refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // 3.4 Logout
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate refresh token' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
  }

  // 3.5 Register (customer)
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Customer self-registration with phone OTP' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 3.5 Send OTP
  @Post('send-otp')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone for registration' })
  async sendOtp(@Body() body: { phone: string }) {
    // Returns { devOtp } only in dev-mode; {} in production (SMS sent).
    return this.authService.sendOtp(body.phone);
  }

  // 3.5c Login with OTP — send the code (passwordless)
  @Post('login-otp')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP for passwordless login' })
  async loginOtpSend(@Body() body: { phone: string }) {
    if (!body?.phone?.trim()) {
      return { error: 'Phone is required' };
    }
    return this.authService.sendOtp(body.phone);
  }

  // 3.5c Login with OTP — verify and issue tokens
  @Post('login-otp/verify')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and log in (passwordless)' })
  async loginOtpVerify(@Body() body: { phone: string; otp: string }) {
    if (!body?.phone?.trim() || !body?.otp?.trim()) {
      return { error: 'Phone and OTP are required' };
    }
    return this.authService.loginWithOtp(body.phone, body.otp);
  }

  // 3.6 Forgot password
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request password reset link' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.identifier);
  }

  // 3.6 Reset password
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // 3.7 Get profile
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  // 3.7 Update profile
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.sub, dto);
  }

  // 3.7 Change password
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (requires current password)' })
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.sub, dto);
    return { message: 'Password changed successfully. Please log in again.' };
  }

  // 3.8 Email verification
  @Get('verify-email')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address via token' })
  @ApiQuery({ name: 'token', required: true, description: 'Verification token from email' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // 3.8 Resend verification email
  @Post('resend-verification')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body() body: { identifier: string }) {
    return this.authService.resendVerificationEmail(body.identifier);
  }
}
