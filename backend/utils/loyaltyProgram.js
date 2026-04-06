export const LOYALTY_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minLifetimePoints: 0,
    pointsMultiplier: 1,
    birthdayBonus: 10,
    benefits: ['Earn 1 point per LE 100 spent', 'Birthday bonus: 10 points'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minLifetimePoints: 100,
    pointsMultiplier: 1.25,
    birthdayBonus: 20,
    benefits: [
      'Earn 1.25 points per LE 100 spent',
      'Birthday bonus: 20 points',
      'Early access to selected drops',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    minLifetimePoints: 500,
    pointsMultiplier: 1.5,
    birthdayBonus: 50,
    benefits: [
      'Earn 1.5 points per LE 100 spent',
      'Birthday bonus: 50 points',
      'Priority support and VIP-only rewards',
    ],
  },
];

export const LOYALTY_ACTIVITY_RULES = [
  {
    id: 'newsletter_signup',
    name: 'Join the mailing list',
    points: 10,
    icon: 'mail',
    repeatable: false,
  },
  {
    id: 'instagram_follow',
    name: 'Follow us on Instagram',
    points: 5,
    icon: 'instagram',
    repeatable: false,
  },
  {
    id: 'birthday_bonus',
    name: 'Birthday bonus',
    points: 0,
    icon: 'cake',
    repeatable: true,
  },
];

export const LOYALTY_REWARDS = [
  {
    id: 'reward_5_off',
    name: '5% Off Reward',
    description: 'Unlock a 5% reward code for a future order.',
    pointsCost: 50,
    kind: 'percentage_discount',
    value: 5,
  },
  {
    id: 'reward_free_shipping',
    name: 'Free Shipping Reward',
    description: 'Unlock a free shipping reward code.',
    pointsCost: 75,
    kind: 'free_shipping',
    value: 0,
  },
  {
    id: 'reward_10_off',
    name: '10% Off Reward',
    description: 'Unlock a 10% reward code for a future order.',
    pointsCost: 100,
    kind: 'percentage_discount',
    value: 10,
  },
  {
    id: 'reward_15_off',
    name: '15% Off Reward',
    description: 'Unlock a 15% reward code for a future order.',
    pointsCost: 150,
    kind: 'percentage_discount',
    value: 15,
  },
];

const LOYALTY_POINTS_PER_100_EGP = 1;
export const LOYALTY_SIGNUP_BONUS = 5;

export const getTierForLifetimePoints = (lifetimePoints = 0) => {
  const normalizedPoints = Number(lifetimePoints || 0);

  return [...LOYALTY_TIERS]
    .reverse()
    .find((tier) => normalizedPoints >= tier.minLifetimePoints) || LOYALTY_TIERS[0];
};

export const getNextTier = (lifetimePoints = 0) => {
  const normalizedPoints = Number(lifetimePoints || 0);
  return LOYALTY_TIERS.find((tier) => tier.minLifetimePoints > normalizedPoints) || null;
};

export const calculatePurchasePoints = ({
  subtotal = 0,
  lifetimePoints = 0,
}) => {
  const tier = getTierForLifetimePoints(lifetimePoints);
  const basePoints = Math.floor((Number(subtotal || 0) / 100) * LOYALTY_POINTS_PER_100_EGP);
  return Math.max(Math.floor(basePoints * tier.pointsMultiplier), 0);
};

export const getActivityRule = (activityId) =>
  LOYALTY_ACTIVITY_RULES.find((activity) => activity.id === activityId) || null;

export const getRewardRule = (rewardId) =>
  LOYALTY_REWARDS.find((reward) => reward.id === rewardId) || null;

export const createRewardCode = (rewardId) => {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MON-${rewardId.replace('reward_', '').toUpperCase()}-${suffix}`;
};

export const isBirthdayToday = (birthday) => {
  if (!birthday) {
    return false;
  }

  const birthDate = new Date(birthday);
  const today = new Date();

  return (
    birthDate.getUTCDate() === today.getUTCDate()
    && birthDate.getUTCMonth() === today.getUTCMonth()
  );
};

export const getLoyaltyActivityPoints = ({
  activityId,
  tierId,
}) => {
  const activity = getActivityRule(activityId);
  if (!activity) {
    return 0;
  }

  if (activityId === 'birthday_bonus') {
    return getTierForLifetimePoints(
      LOYALTY_TIERS.find((tier) => tier.id === tierId)?.minLifetimePoints || 0
    ).birthdayBonus;
  }

  return activity.points;
};
