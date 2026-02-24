import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../entities/role.enitity';
import { Permission, PermissionSchema } from '../entities/permission.entity';

export const rolesDbModule = MongooseModule.forFeature([
    { name: Role.name, schema: RoleSchema },
    { name: Permission.name, schema: PermissionSchema },
]);
