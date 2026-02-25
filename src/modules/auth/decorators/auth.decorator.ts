import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthMetadata } from '../../../common/types/auth-metadata.type';
import { AuthGuard } from '../guards/auth.guard';
export const AUTH_METADATA_KEY = 'auth_metadata';

/**
 * Authentication and Authorization decorator
 * Protects endpoints with role and permission checks
 * 
 * @param metadata - Object containing roles, permissions, and validation options
 * @param metadata.validateToken - Use JWT token validation (true) or API key validation (false/undefined). Default: API key
 * 
 * @example
 * // Default: API key validation with ADMIN role required
 * @Auth({ roles: [UserRoleEnum.ADMIN] })
 * 
 * @example
 * // Require JWT token validation and specific permission
 * @Auth({
 *   validateToken: true,
 *   permissions: [
 *     { target: 'user', action: DefaultPermissionActionsEnum.CREATE }
 *   ]
 * })
 * 
 * @example
 * // Explicit API key validation (same as default)
 * @Auth({ validateToken: false })
 * 
 * @example
 * // JWT token with role check
 * @Auth({
 *   validateToken: true,
 *   roles: [UserRoleEnum.ADMIN]
 * })
 */
export function Auth(metadata: AuthMetadata = {}) {
  return applyDecorators(
    SetMetadata(AUTH_METADATA_KEY, metadata),
    UseGuards(AuthGuard),
  );
}
