import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Identity } from '../../auth-base/identities/entities/identity.entity';
import { Role } from '../../roles/entities/role.entity';

@GeneratePermissions()
@Schema({
  timestamps: true,
})
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
