import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '../entities/permission.entity';

export const permissionDbModule = MongooseModule.forFeature([
    { name: Permission.name, schema: PermissionSchema },
]);
