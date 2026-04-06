import mongoose from 'mongoose';
import Event from '../models/event.model.js';

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  );
};

const getRequestIp = (req) => {
  const forwardedFor = req.headers?.['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || '';
};

export const trackEvent = async ({
  eventType,
  req,
  userId = null,
  sessionId = '',
  productId = null,
  orderId = null,
  metadata = {},
  occurredAt,
}) => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  try {
    return await Event.create({
      eventType,
      user: userId,
      sessionId,
      product: productId,
      order: orderId,
      path: req?.originalUrl || req?.path || '',
      method: req?.method || '',
      referrer: req?.headers?.referer || req?.headers?.referrer || '',
      userAgent: req?.headers?.['user-agent'] || '',
      ipAddress: req ? getRequestIp(req) : '',
      metadata: sanitizeMetadata(metadata),
      occurredAt: occurredAt || new Date(),
    });
  } catch (error) {
    console.error('Failed to record analytics event:', error);
    return null;
  }
};
