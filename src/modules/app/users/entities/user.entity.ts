import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity, SCHEMA_OPTIONS } from 'src/common/entities/app-base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Role } from '../../roles/entities/role.entity';

@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
export class User extends AppBaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization' })
  organization: string | Organization;

  @Prop()
  username: string;

  @Prop()
  email:string;

  @Prop({ type: Boolean, default: false })
  isBlocked: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Role.name })
  role?: string | Role;
}

export type UserDocument = User;

export const UserSchema = SchemaFactory.createForClass(User);

// Queried when listing users per organization
UserSchema.index({ organization: 1 });
// Duplicate check on user creation (email is unique per org)
UserSchema.index({ organization: 1, email: 1 }, { unique: true });
// Used for role lookups on users
UserSchema.index({ role: 1 });
