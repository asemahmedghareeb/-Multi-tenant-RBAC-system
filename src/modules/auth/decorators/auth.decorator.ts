import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthMetadata } from '../../../common/types/auth-metadata.type';
import { AuthGuard } from '../guards/auth.guard';
export const AUTH_METADATA_KEY = 'auth_metadata';


export function Auth(metadata: AuthMetadata = {}) {
  return applyDecorators(
    SetMetadata(AUTH_METADATA_KEY, metadata),
    UseGuards(AuthGuard),
  );
}
