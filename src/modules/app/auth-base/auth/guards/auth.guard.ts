import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthMetadata } from 'src/common/types/auth-metadata.type';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { UserType } from '../enums/user-type.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { AuthValidationService } from '../helpers/auth-validation.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authValidationService: AuthValidationService,
  ) {}

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
