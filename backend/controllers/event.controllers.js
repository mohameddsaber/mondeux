import { trackEvent } from '../utils/trackEvent.js';

export const ingestEvent = async (req, res) => {
  const {
    eventType,
    sessionId,
    productId,
    orderId,
    metadata = {},
    occurredAt,
  } = req.body;

  await trackEvent({
    eventType,
    req,
    userId: req.user?._id || null,
    sessionId,
    productId,
    orderId,
    metadata,
    occurredAt,
  });

  res.status(202).json({
    success: true,
    message: 'Event accepted',
  });
};
