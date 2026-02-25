import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OrganizationSignupDto } from './dto/organization-signup.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { RequestOtpDto } from './dto/request-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('organization-signup')
  @ApiBody({ type: OrganizationSignupDto })
  signUp(@Body() data: OrganizationSignupDto) {
    return this.authService.signUp(data);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    await this.authService.verifyOtp(data);
    return { message: 'OTP verified successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    await this.authService.resetPassword(data);
    return { message: 'Password reset successfully' };
  }

  @Post('request-otp')
  async requestOtp(@Body() data: RequestOtpDto) {
    await this.authService.requestOtp(data);

    return { message: 'OTP sent successfully' };
  }
}
