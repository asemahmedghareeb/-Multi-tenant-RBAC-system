import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity, SCHEMA_OPTIONS } from 'src/common/entities/app-base.entity';

import { Schema as MongooseSchema } from 'mongoose';
import { Organization } from '../../organization/entities/organization.entity';
@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
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

// Permissions are always scoped to an organization
PermissionSchema.index({ organization: 1 });
// Auth guard checks permissions by resource + action
PermissionSchema.index({ resource: 1, action: 1 });
// Compound: unique permission per org (resource+action pair)
PermissionSchema.index({ organization: 1, resource: 1, action: 1 }, { unique: true });
