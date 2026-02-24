import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import bcrypt from 'bcrypt';
import { Role } from 'src/modules/roles/entities/role.enitity';
import { UserType } from 'src/modules/auth/enums/user-type.enum';
import { IdentityStatus } from '../enums/identity-status.enum';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';

@GeneratePermissions()
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Identity extends AppBaseEntity {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  otp?: string;

  @Prop()
  otpExpireAt?: Date;

  @Prop({ default: false })
  canResetPassword: boolean;

  @Prop({ default: false })
  dataCompleted: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, default: IdentityStatus.ACTIVE, enum: IdentityStatus })
  status: string;

  @Prop({ type: String, default: UserType.ORGANIZATION, enum: UserType })
  type: string;

  @Prop({ type: Date, expires: 0 })
  expireAt?: Date;

  @Prop({ default: false })
  isSuperAdmin?: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Role.name })
  role?: string | Role;
}

export type IdentityDocument = Identity;

export const IdentitySchema = SchemaFactory.createForClass(Identity);

// virtual realtions to get users/organizations information
IdentitySchema.virtual('user', {
  ref: 'User',
  localField: '_id',
  foreignField: 'identity',
  justOne: true,
});

IdentitySchema.virtual('organization', {
  ref: 'Organization',
  localField: '_id',
  foreignField: 'identity',
  justOne: true,
});

IdentitySchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

IdentitySchema.methods.comparePassword = async function (
  enteredPassword: string,
) {
  return await bcrypt.compare(enteredPassword, this.password);
};
