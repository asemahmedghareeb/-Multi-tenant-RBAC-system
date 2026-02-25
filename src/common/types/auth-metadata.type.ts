import { UserType } from 'src/modules/auth/enums/user-type.enum';

export interface PermissionRequirement {
  target: string;
  action: string; 
}

export interface AuthMetadata {
  roles?: UserType[];
  permissions?: PermissionRequirement[];
  validateToken?: boolean;
}
