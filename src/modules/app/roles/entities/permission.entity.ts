import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';

import { Schema as MongooseSchema } from 'mongoose';
import { Organization } from '../../organization/entities/organization.entity';
@GeneratePermissions()
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Permission extends AppBaseEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organization: Organization;

  @Prop({ type: String, required: true })
  resource: string;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String })
  arName: string;

  @Prop({ type: String })
  enName: string;
}

export type PermissionDocument = Permission;
export const PermissionSchema = SchemaFactory.createForClass(Permission);
