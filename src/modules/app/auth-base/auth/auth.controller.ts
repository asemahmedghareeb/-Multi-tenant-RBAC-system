import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OrganizationSignupDto } from './dto/organization-signup.dto';
import { ApiBody } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { RequestOtpDto } from './dto/request-otp.dto';
import { OrganizationSignInDto } from './dto/organization-signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiUtil } from 'src/common/utils/response-util';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('organization-signup')
  @ApiBody({ type: OrganizationSignupDto })
  async signUp(@Body() data: OrganizationSignupDto) {
    const result = await this.authService.signUp(data);
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, result);
  }

  @Post('organization-signin')
  @ApiBody({ type: OrganizationSignInDto })
  async signin(@Body() data: OrganizationSignInDto) {
    const result = await this.authService.signIn(data);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    await this.authService.verifyOtp(data);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, { message: 'OTP verified successfully' });
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    await this.authService.resetPassword(data);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, { message: 'Password reset successfully' });
  }

  @Post('request-otp')
  async requestOtp(@Body() data: RequestOtpDto) {
    await this.authService.requestOtp(data);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, { message: 'OTP sent successfully' });
  }

  @Post('refresh-token')
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() data: RefreshTokenDto) {
    const result = await this.authService.refreshToken(data.refreshToken);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }
}
