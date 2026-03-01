import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { SubscriptionTiers } from '../enums/subscription-tiers.enum';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity, SCHEMA_OPTIONS } from 'src/common/entities/app-base.entity';
import { Organization } from 'src/modules/app/organization/entities/organization.entity';

@GeneratePermissions()
@Schema(SCHEMA_OPTIONS)
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

// Looked up on every API key request in the auth guard
// key field already has a unique index from the Prop definition
// List all keys for an organization (api-keys service)
ApiKeySchema.index({ organization: 1 });
// Expiry check uses createdAt; compound helps filter expired+org keys
ApiKeySchema.index({ organization: 1, createdAt: 1 });
