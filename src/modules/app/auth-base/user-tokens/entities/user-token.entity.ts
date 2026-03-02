import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity, SCHEMA_OPTIONS } from 'src/common/entities/app-base.entity';
import { Identity } from '../../identities/entities/identity.entity';

@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
export class UserToken extends AppBaseEntity {
  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
  user: string | Identity;
}

export type UserTokenDocument = UserToken;

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

UserTokenSchema.index({ accessToken: 1 }, { unique: true, sparse: true });
UserTokenSchema.index({ refreshToken: 1 }, { unique: true, sparse: true });
UserTokenSchema.index({ user: 1 });
UserTokenSchema.index({ user: 1, accessToken: 1 });
UserTokenSchema.index({ user: 1, refreshToken: 1 });
