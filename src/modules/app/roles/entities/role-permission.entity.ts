import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import {
  AppBaseEntity,
  SCHEMA_OPTIONS,
} from 'src/common/entities/app-base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Identity } from '../../auth-base/identities/entities/identity.entity';

/**
 * RolePermission Entity
 *
 * Junction table for many-to-many relationship between Role and Permission
 * Provides referential integrity and audit trail for permission assignments
 *
 * Benefits over storing permissions array in Role:
 * - Cascade delete: When permission is deleted, all role_permissions are cleaned up
 * - Audit trail: Can track who assigned permissions and when
 * - Backward queries: Efficiently find which roles have a specific permission
 * - Scalability: No document size limits on role permissions
 */
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

// Indexes for performance and uniqueness
// Prevent duplicate permission assignments to the same role
RolePermissionSchema.index(
  { role: 1, permission: 1 },
  { unique: true, sparse: true },
);

// Efficient queries when permission is being deleted (cascade cleanup)
RolePermissionSchema.index({ permission: 1 });

// Find all permissions for a role
RolePermissionSchema.index({ role: 1 });
