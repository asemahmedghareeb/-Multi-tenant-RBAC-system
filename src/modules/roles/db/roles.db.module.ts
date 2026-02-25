import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../entities/role.entity';

export const rolesDbModule = MongooseModule.forFeature([
    { name: Role.name, schema: RoleSchema },
]);
