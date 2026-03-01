import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthMetadata } from 'src/common/types/auth-metadata.type';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { UserType } from '../enums/user-type.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { AuthValidationService } from '../helpers/auth-validation.service';

/**
 * AuthGuard - Comprehensive authentication and authorization guard
 *
 * This guard provides multi-layer security validation:
 * 1. **Authentication**: Validates user identity via JWT token or API key
 * 2. **Authorization**: Enforces role-based (RBAC) and permission-based (PBAC) access control
 * 3. **Account Validation**: Checks user verification status and account status
 * 4. **Rate Limiting**: Enforces API key usage limits based on subscription tier
 * 5. **Token Session Validation**: Ensures tokens exist in the session store
 *
 * Error Handling:
 * - Provides descriptive, localized error messages for all failure scenarios
 * - Logs detailed warnings for debugging and monitoring
 * - Returns appropriate HTTP status codes based on error type
 *
 * Supported Authentication Methods:
 * - Bearer JWT tokens: Authorization header with format "Bearer <token>"
 * - API Keys: x-api-key header for service-to-service authentication
 *
 * Dependencies:
 * - AuthValidationService: Handles all authentication/authorization logic
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authValidationService: AuthValidationService,
  ) {}

  /**
   * Main guard activation method
   *
   * Execution flow:
   * 1. Extract auth method preference from route metadata
   * 2. Extract and validate authentication credentials (JWT or API key)
   * 3. Validate user identity exists and is active
   * 4. Check role-based access control if required by route
   * 5. Check permission-based access control if required by route
   * 6. Grant access if all checks pass
   *
   * @param context The execution context containing request/response
   * @returns true if all security checks pass, throws AppHttpException otherwise
   * @throws AppHttpException with descriptive localized error messages
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authMetadata = this.reflector.get<AuthMetadata>(
      AUTH_METADATA_KEY,
      context.getHandler(),
    );

    let identity: any;

    const useTokenValidation = authMetadata?.validateToken === true;

    if (useTokenValidation) {
      const token = this.authValidationService.extractTokenFromHeader(request);
      if (!token) {
        throw new AppHttpException(
          ErrorMessageEnum.MISSING_AUTHORIZATION_HEADER,
        );
      }
      identity = await this.authValidationService.validateToken(token);
    } else {
      const apiKey = this.authValidationService.extractApiKey(request);
      if (!apiKey) {
        throw new AppHttpException(
          ErrorMessageEnum.MISSING_API_KEY_HEADER,
        );
      }
      identity = await this.authValidationService.validateApiKey(apiKey);
    }

    request.user = identity;

    if (!authMetadata) {
      return true;
    }

    if (identity.isSuperAdmin) {
      return true;
    }

    if (
      authMetadata.allowInCompletedProfiles === false &&
      identity.dataCompleted === false
    ) {
      throw new AppHttpException(
        ErrorMessageEnum.PROFILE_COMPLETION_REQUIRED,
      );
    }

    if (authMetadata.roles && authMetadata.roles.length > 0) {
      const hasRole = await this.authValidationService.checkRoles(
        identity,
        authMetadata.roles,
      );
      if (!hasRole) {
        throw new AppHttpException(ErrorMessageEnum.INSUFFICIENT_ROLE);
      }
    }

    if (
      authMetadata.permissions &&
      authMetadata.permissions.length > 0 &&
      identity.UserType !== UserType.ORGANIZATION
    ) {
      const hasPermissions =
        await this.authValidationService.checkPermissions(
          identity,
          authMetadata.permissions,
        );
      if (!hasPermissions) {
        throw new AppHttpException(
          ErrorMessageEnum.INSUFFICIENT_PERMISSIONS,
        );
      }
    }

    return true;
  }
}
