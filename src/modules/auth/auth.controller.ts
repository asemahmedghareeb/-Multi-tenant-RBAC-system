import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OrganizationSignupDto } from './dto/organization-signup.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('organization-signup')
  @ApiBody({ type: OrganizationSignupDto })
  signUp(@Body() data: OrganizationSignupDto) {
    return this.authService.signUp(data);
  }
}
