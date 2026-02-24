import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/modules/organization/entities/organization.entity';
import { SubscriptionTiers } from '../enums/subscribtion-tiers.enum';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';

@GeneratePermissions()
@Schema({
  timestamps: true,
})
export class ApiKey extends AppBaseEntity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization' })
  organization: string | Organization;

  @Prop({ type: String, unique: true })
  key: string;

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  @Prop({
    type: String,
    default: SubscriptionTiers.FREE,
    enum: SubscriptionTiers,
  })
  tier: SubscriptionTiers;
}

export type ApiKeyDocument = ApiKey;

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

