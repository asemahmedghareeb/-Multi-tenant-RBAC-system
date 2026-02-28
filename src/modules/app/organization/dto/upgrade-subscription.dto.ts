import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionTiers } from '../../api-keys/enums/subscribtion-tiers.enum';

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionTiers)
  @IsNotEmpty()
  subscriptionTier: SubscriptionTiers;
}
