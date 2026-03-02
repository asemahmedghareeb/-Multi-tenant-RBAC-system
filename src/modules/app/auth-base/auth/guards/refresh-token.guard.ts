import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { AuthValidationService } from '../helpers/auth-validation.service';

/**
 * Refresh Token Guard
 * 
 * Validates refresh tokens for endpoints that handle token refresh operations.
 * Extracts refresh token from either:
 * - x-refresh-token header
 * - refreshToken field in request body
 * 
 * Usage: @UseGuards(RefreshTokenGuard)
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authValidationService: AuthValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract refresh token from header or body
    const refreshToken = this.authValidationService.extractRefreshToken(request);

    if (!refreshToken) {
      throw new AppHttpException(
        ErrorMessageEnum.MISSING_REFRESH_TOKEN,
      );
    }

    // Validate the refresh token and attach user to request
    const user = await this.authValidationService.validateRefreshToken(
      refreshToken,
    );
    request.user = user;

    return true;
  }
}
