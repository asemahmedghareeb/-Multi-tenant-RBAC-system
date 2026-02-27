import { createDbModule } from 'src/common/repositories/repository.module';
import { Permission, PermissionSchema } from '../entities/permission.entity';

export const permissionDbModule = createDbModule(Permission, PermissionSchema);
