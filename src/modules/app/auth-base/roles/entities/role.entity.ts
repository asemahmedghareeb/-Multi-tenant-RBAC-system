import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity, SCHEMA_OPTIONS } from 'src/common/entities/app-base.entity';
import { Organization } from '../../../organization/entities/organization.entity';

@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
export class Role extends AppBaseEntity {
  @Prop({
    type: { _id: false, ar: String, en: String },
  })
  name: {
    ar: string;
    en: string; 
  };

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organization: Organization;

  @Prop({ default: false })
  isSuperAdmin: boolean;
}

export type RoleDocument = Role;

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ organization: 1 });
RoleSchema.index({ organization: 1, 'name.en': 1 }, { unique: true });
RoleSchema.index({ organization: 1, 'name.ar': 1 }, { unique: true });
RoleSchema.index({ _id: 1, organization: 1 });
