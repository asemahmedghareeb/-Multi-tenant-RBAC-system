import { SubscriptionTiers } from './subscribtion-tiers.enum';

type TierLimit = {
  requestsPerMonth: number;
  maxKeys: number;
};

export const TIER_LIMITS: Record<SubscriptionTiers, TierLimit> = {
  [SubscriptionTiers.FREE]: {
    requestsPerMonth: 1000,
    maxKeys: 1,
  },
  [SubscriptionTiers.PRO]: {
    requestsPerMonth: 10000,
    maxKeys: 5,
  },
  [SubscriptionTiers.ENTERPRISE]: {
    requestsPerMonth: 100000,
    maxKeys: 50,
  },
};
