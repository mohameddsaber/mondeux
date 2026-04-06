import Promotion from '../models/promotion.model.js';

const normalizePromotionPayload = (payload = {}) => {
  const normalizedPayload = { ...payload };

  if (Object.prototype.hasOwnProperty.call(payload, 'code')) {
    const normalizedCode = typeof payload.code === 'string' ? payload.code.trim().toUpperCase() : '';
    normalizedPayload.code = normalizedCode || null;
  }

  return normalizedPayload;
};

export const getAdminPromotions = async (req, res) => {
  try {
    const filter = {};

    if (typeof req.query.active === 'boolean') {
      filter.isActive = req.query.active;
    }

    const promotions = await Promotion.find(filter).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(normalizePromotionPayload(req.body));

    res.status(201).json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      normalizePromotionPayload(req.body),
      {
        new: true,
        runValidators: true,
      }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found',
      });
    }

    res.json({
      success: true,
      data: promotion,
      message: 'Promotion updated successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
