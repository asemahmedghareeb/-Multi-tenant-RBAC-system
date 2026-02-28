import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Identity } from '../../auth-base/identities/entities/identity.entity';

@GeneratePermissions()
@Schema({
  timestamps: true,
})
export class User extends AppBaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization' })
  organization: string | Organization;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
  identity: string | Identity;

  @Prop()
  username: string;
}

export type UserDocument = User;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ identity: 1 }, { unique: true });
