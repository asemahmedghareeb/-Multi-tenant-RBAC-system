import { createDbModule } from 'src/common/repositories/repository.module';
import { RolePermission, RolePermissionSchema } from '../entities/role-permission.entity';

export const rolePermissionDbModule = createDbModule(RolePermission, RolePermissionSchema);
