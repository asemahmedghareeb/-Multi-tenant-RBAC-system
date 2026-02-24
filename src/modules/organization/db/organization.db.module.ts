import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from '../entities/organization.entity';

export const organizationDbModule = MongooseModule.forFeature([
    { name: Organization.name, schema: OrganizationSchema },
]);
