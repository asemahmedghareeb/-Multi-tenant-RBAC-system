import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AuthMetadata } from 'src/common/types/auth-metadata.type';
export const AUTH_METADATA_KEY = 'auth_metadata';


export function Auth(metadata: AuthMetadata = {}) {
  return applyDecorators(
    SetMetadata(AUTH_METADATA_KEY, metadata),
    UseGuards(AuthGuard),
  );
}
