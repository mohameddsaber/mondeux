import {
  LOYALTY_ACTIVITY_RULES,
  LOYALTY_REWARDS,
  LOYALTY_TIERS,
  getLoyaltyActivityPoints,
  getNextTier,
  getTierForLifetimePoints,
  isBirthdayToday,
} from './loyaltyProgram.js';

const ensureLoyaltyState = (user) => {
  if (!user.loyalty) {
    user.loyalty = {};
  }

  user.loyalty.pointsBalance = Number(user.loyalty.pointsBalance || 0);
  user.loyalty.lifetimePoints = Number(user.loyalty.lifetimePoints || 0);
  user.loyalty.redeemedPoints = Number(user.loyalty.redeemedPoints || 0);
  user.loyalty.activityClaims = Array.isArray(user.loyalty.activityClaims)
    ? user.loyalty.activityClaims
    : [];
  user.loyalty.history = Array.isArray(user.loyalty.history)
    ? user.loyalty.history
    : [];
  user.loyalty.rewardRedemptions = Array.isArray(user.loyalty.rewardRedemptions)
    ? user.loyalty.rewardRedemptions
    : [];
  user.loyalty.tier = user.loyalty.tier || 'bronze';

  return user.loyalty;
};

export const awardLoyaltyPoints = ({
  user,
  points,
  type,
  description,
  metadata = {},
  occurredAt = new Date(),
}) => {
  const loyalty = ensureLoyaltyState(user);
  const normalizedPoints = Math.max(Number(points || 0), 0);

  if (!normalizedPoints) {
    return 0;
  }

  loyalty.pointsBalance += normalizedPoints;
  loyalty.lifetimePoints += normalizedPoints;
  loyalty.tier = getTierForLifetimePoints(loyalty.lifetimePoints).id;
  loyalty.history.unshift({
    type,
    direction: 'earned',
    points: normalizedPoints,
    description,
    metadata,
    createdAt: occurredAt,
  });

  return normalizedPoints;
};

export const deductLoyaltyPoints = ({
  user,
  points,
  type,
  description,
  metadata = {},
  occurredAt = new Date(),
  countAsRedeemed = true,
  affectLifetimePoints = false,
  direction = 'redeemed',
}) => {
  const loyalty = ensureLoyaltyState(user);
  const normalizedPoints = Math.max(Number(points || 0), 0);

  if (!normalizedPoints) {
    return 0;
  }

  loyalty.pointsBalance = Math.max(loyalty.pointsBalance - normalizedPoints, 0);
  if (countAsRedeemed) {
    loyalty.redeemedPoints += normalizedPoints;
  }
  if (affectLifetimePoints) {
    loyalty.lifetimePoints = Math.max(loyalty.lifetimePoints - normalizedPoints, 0);
    loyalty.tier = getTierForLifetimePoints(loyalty.lifetimePoints).id;
  }
  loyalty.history.unshift({
    type,
    direction,
    points: normalizedPoints,
    description,
    metadata,
    createdAt: occurredAt,
  });

  return normalizedPoints;
};

export const serializeLoyalty = (user) => {
  const loyalty = ensureLoyaltyState(user);
  const currentTier = getTierForLifetimePoints(loyalty.lifetimePoints);
  const nextTier = getNextTier(loyalty.lifetimePoints);

  return {
    pointsBalance: loyalty.pointsBalance,
    lifetimePoints: loyalty.lifetimePoints,
    redeemedPoints: loyalty.redeemedPoints,
    tier: currentTier.id,
    tiers: LOYALTY_TIERS,
    currentTier,
    nextTier,
    birthday: loyalty.birthday || null,
    availableActions: LOYALTY_ACTIVITY_RULES.map((activity) => {
      const claims = loyalty.activityClaims.filter((claim) => claim.activityId === activity.id);
      const lastClaim = claims[0] || null;
      const currentYear = new Date().getUTCFullYear();
      const claimedThisYear = claims.some((claim) => Number(claim.claimYear) === currentYear);
      const canClaim = activity.id === 'birthday_bonus'
        ? Boolean(loyalty.birthday) && isBirthdayToday(loyalty.birthday) && !claimedThisYear
        : activity.repeatable || claims.length === 0;

      return {
        ...activity,
        points: getLoyaltyActivityPoints({
          activityId: activity.id,
          tierId: currentTier.id,
        }),
        claimedAt: lastClaim?.claimedAt || null,
        isClaimed: activity.repeatable ? claimedThisYear : claims.length > 0,
        canClaim,
      };
    }),
    rewards: LOYALTY_REWARDS.map((reward) => ({
      ...reward,
      affordable: loyalty.pointsBalance >= reward.pointsCost,
    })),
    recentHistory: loyalty.history
      .slice(0, 10)
      .map((entry) => ({
        type: entry.type,
        direction: entry.direction,
        points: entry.points,
        description: entry.description,
        metadata: entry.metadata || {},
        createdAt: entry.createdAt,
      })),
    rewardRedemptions: loyalty.rewardRedemptions
      .slice(0, 10)
      .map((reward) => ({
        rewardId: reward.rewardId,
        rewardName: reward.rewardName,
        pointsCost: reward.pointsCost,
        code: reward.code,
        redeemedAt: reward.redeemedAt,
        status: reward.status,
      })),
  };
};

export const serializeSessionUser = (user) => {
  const loyalty = ensureLoyaltyState(user);
  const currentTier = getTierForLifetimePoints(loyalty.lifetimePoints);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    loyalty: {
      pointsBalance: loyalty.pointsBalance,
      lifetimePoints: loyalty.lifetimePoints,
      tier: currentTier.id,
    },
  };
};
