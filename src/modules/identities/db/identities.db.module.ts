import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from '../entities/identity.entity';

export const identitiesDbModule = MongooseModule.forFeature([
    { name: Identity.name, schema: IdentitySchema },
]);
