import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';
import { SubscriptionTiers } from '../../api-keys/enums/subscription-tiers.enum';
import { Identity } from '../../auth-base/identities/entities/identity.entity';

@GeneratePermissions()
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Organization extends AppBaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
  identity: string | Identity;

  @Prop()
  name: string;

  @Prop({
    type: String,
    enum: SubscriptionTiers,
    default: SubscriptionTiers.FREE,
  })
  subscriptionTier: SubscriptionTiers;
}

export type OrganizationDocument = Organization;

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.index({ identity: 1 }, { unique: true });

OrganizationSchema.virtual('apiKeys', {
  ref: 'ApiKey',
  localField: '_id',
  foreignField: 'organization',
  justOne: false,
});
