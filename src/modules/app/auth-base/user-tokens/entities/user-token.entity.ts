import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';
import { Identity } from '../../identities/entities/identity.entity';

@GeneratePermissions()
@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class UserToken extends AppBaseEntity {
    @Prop()
    token: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
    user: string | Identity;
}

export type UserTokenDocument = UserToken;

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

UserTokenSchema.index({ token: 1 }, { unique: true });
UserTokenSchema.index({ user: 1 });
UserTokenSchema.index({ user: 1, token: 1 });
