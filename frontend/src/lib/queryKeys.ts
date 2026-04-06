export const queryKeys = {
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
  cart: {
    detail: ["cart", "detail"] as const,
  },
  loyalty: {
    detail: ["loyalty", "detail"] as const,
  },
  wishlist: {
    detail: ["wishlist", "detail"] as const,
  },
  reviews: {
    product: (productId: string) => ["reviews", "product", productId] as const,
    admin: (params: Record<string, unknown>) =>
      ["reviews", "admin", params] as const,
  },
  promotions: {
    pricing: (couponCode: string) =>
      ["promotions", "pricing", couponCode] as const,
  },
  products: {
    list: (scope: string, params: Record<string, unknown>) =>
      ["products", "list", scope, params] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
  },
  orders: {
    mine: (page: number, limit: number) =>
      ["orders", "mine", page, limit] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
    admin: (limit?: number) => ["orders", "admin", { limit }] as const,
  },
  admin: {
    users: ["admin", "users"] as const,
    categories: ["admin", "categories"] as const,
    subCategories: ["admin", "subCategories"] as const,
    promotions: ["admin", "promotions"] as const,
    salesSummary: ["admin", "sales", "summary"] as const,
    salesByDate: ["admin", "sales", "byDate"] as const,
    analytics: {
      funnel: (days: number) => ["admin", "analytics", "funnel", days] as const,
      topProducts: (days: number, limit: number) =>
        ["admin", "analytics", "topProducts", { days, limit }] as const,
      repeatCustomers: (days: number, limit: number) =>
        ["admin", "analytics", "repeatCustomers", { days, limit }] as const,
      lowConversionPages: (days: number, limit: number, minVisitors: number) =>
        [
          "admin",
          "analytics",
          "lowConversionPages",
          { days, limit, minVisitors },
        ] as const,
    },
  },
} as const;
