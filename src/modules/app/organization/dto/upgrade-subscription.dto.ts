import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionTiers } from '../../api-keys/enums/subscription-tiers.enum';

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionTiers)
  @IsNotEmpty()
  subscriptionTier: SubscriptionTiers;
}
