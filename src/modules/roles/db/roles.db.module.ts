import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../entities/role.enitity';

export const rolesDbModule = MongooseModule.forFeature([
    { name: Role.name, schema: RoleSchema },
]);
