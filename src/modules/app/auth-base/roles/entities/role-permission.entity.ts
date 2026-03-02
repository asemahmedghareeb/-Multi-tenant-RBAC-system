import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import {
  AppBaseEntity,
  SCHEMA_OPTIONS,
} from 'src/common/entities/app-base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Identity } from '../../identities/entities/identity.entity';


@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
export class RolePermission extends AppBaseEntity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Role',
    required: true,
  })
  role: string | Role;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Permission',
    required: true,
  })
  permission: string | Permission;

  @Prop({ type: String, ref: 'Identity' })
  assignedBy?: string | Identity;

  @Prop({ type: Date, default: Date.now })
  assignedAt?: Date;
}

export type RolePermissionDocument = RolePermission;

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);

RolePermissionSchema.index(
  { role: 1, permission: 1 },
  { unique: true, sparse: true },
);

RolePermissionSchema.index({ permission: 1 });

RolePermissionSchema.index({ role: 1 });
