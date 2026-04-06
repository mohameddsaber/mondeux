import { apiFetch } from "./api";

export type AnalyticsEventType =
  | "product_view"
  | "search"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed"
  | "login_success"
  | "login_failure"
  | "signup_success"
  | "signup_failure";

type TrackEventInput = {
  eventType: AnalyticsEventType;
  productId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

const ANALYTICS_SESSION_KEY = "mondeux.analytics.sessionId";

export const getAnalyticsSessionId = () => {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existingSessionId = window.localStorage.getItem(ANALYTICS_SESSION_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const nextSessionId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  window.localStorage.setItem(ANALYTICS_SESSION_KEY, nextSessionId);
  return nextSessionId;
};

export const trackClientEvent = async ({
  eventType,
  productId,
  orderId,
  metadata = {},
  occurredAt,
}: TrackEventInput) => {
  try {
    await apiFetch("/events", {
      method: "POST",
      keepalive: true,
      json: {
        eventType,
        sessionId: getAnalyticsSessionId(),
        productId,
        orderId,
        metadata: {
          pagePath:
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "",
          ...metadata,
        },
        occurredAt,
      },
    });
  } catch (error) {
    console.error("Failed to track client event:", error);
  }
};
