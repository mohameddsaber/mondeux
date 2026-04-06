import User from '../models/user.model.js';
import {
  awardLoyaltyPoints,
  deductLoyaltyPoints,
  serializeLoyalty,
} from '../utils/loyaltyHelpers.js';
import {
  createRewardCode,
  getActivityRule,
  getLoyaltyActivityPoints,
  getRewardRule,
  isBirthdayToday,
} from '../utils/loyaltyProgram.js';

const getUserWithLoyalty = (userId) => User.findById(userId);

export const getMyLoyalty = async (req, res) => {
  try {
    const user = await getUserWithLoyalty(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: serializeLoyalty(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLoyaltyBirthday = async (req, res) => {
  try {
    const user = await getUserWithLoyalty(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.loyalty = user.loyalty || {};
    user.loyalty.birthday = req.body.birthday;
    await user.save();

    res.json({
      success: true,
      data: serializeLoyalty(user),
      message: 'Birthday updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const claimLoyaltyActivity = async (req, res) => {
  try {
    const { activityId } = req.body;
    const activity = getActivityRule(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty activity not found',
      });
    }

    const user = await getUserWithLoyalty(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.loyalty = user.loyalty || {};
    user.loyalty.activityClaims = Array.isArray(user.loyalty.activityClaims)
      ? user.loyalty.activityClaims
      : [];

    const existingClaims = user.loyalty.activityClaims.filter(
      (claim) => claim.activityId === activityId
    );

    if (activityId === 'birthday_bonus') {
      if (!user.loyalty.birthday) {
        return res.status(400).json({
          success: false,
          message: 'Add your birthday first to claim the birthday bonus',
        });
      }

      if (!isBirthdayToday(user.loyalty.birthday)) {
        return res.status(400).json({
          success: false,
          message: 'Birthday bonus can only be claimed on your birthday',
        });
      }

      const currentYear = new Date().getUTCFullYear();
      const alreadyClaimedThisYear = existingClaims.some(
        (claim) => Number(claim.claimYear) === currentYear
      );

      if (alreadyClaimedThisYear) {
        return res.status(400).json({
          success: false,
          message: 'Birthday bonus already claimed this year',
        });
      }

      const points = getLoyaltyActivityPoints({
        activityId,
        tierId: user.loyalty.tier || 'bronze',
      });

      awardLoyaltyPoints({
        user,
        points,
        type: activityId,
        description: 'Birthday bonus claimed',
      });

      user.loyalty.activityClaims.unshift({
        activityId,
        points,
        claimedAt: new Date(),
        claimYear: currentYear,
      });

      await user.save();

      return res.json({
        success: true,
        data: serializeLoyalty(user),
        message: `Claimed ${points} birthday points`,
      });
    }

    if (existingClaims.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This activity has already been claimed',
      });
    }

    awardLoyaltyPoints({
      user,
      points: activity.points,
      type: activityId,
      description: `${activity.name} claimed`,
    });

    user.loyalty.activityClaims.unshift({
      activityId,
      points: activity.points,
      claimedAt: new Date(),
      claimYear: null,
    });

    await user.save();

    res.json({
      success: true,
      data: serializeLoyalty(user),
      message: `Claimed ${activity.points} points`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const redeemLoyaltyReward = async (req, res) => {
  try {
    const reward = getRewardRule(req.body.rewardId);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found',
      });
    }

    const user = await getUserWithLoyalty(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.loyalty = user.loyalty || {};
    user.loyalty.rewardRedemptions = Array.isArray(user.loyalty.rewardRedemptions)
      ? user.loyalty.rewardRedemptions
      : [];

    if (Number(user.loyalty.pointsBalance || 0) < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Not enough points for this reward',
      });
    }

    deductLoyaltyPoints({
      user,
      points: reward.pointsCost,
      type: reward.id,
      description: `${reward.name} redeemed`,
    });

    user.loyalty.rewardRedemptions.unshift({
      rewardId: reward.id,
      rewardName: reward.name,
      pointsCost: reward.pointsCost,
      code: createRewardCode(reward.id),
      redeemedAt: new Date(),
      status: 'available',
    });

    await user.save();

    res.json({
      success: true,
      data: serializeLoyalty(user),
      message: `${reward.name} redeemed successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
