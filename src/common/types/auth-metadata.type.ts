import { UserType } from "src/modules/app/auth-base/auth/enums/user-type.enum";

export interface PermissionRequirement {
  target: string;
  action: string; 
}

export interface AuthMetadata {
  roles?: UserType[];
  permissions?: PermissionRequirement[];
  validateToken?: boolean;
}
