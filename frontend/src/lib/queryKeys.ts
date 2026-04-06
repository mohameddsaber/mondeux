export const queryKeys = {
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },
  cart: {
    detail: ["cart", "detail"] as const,
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
    salesSummary: ["admin", "sales", "summary"] as const,
    salesByDate: ["admin", "sales", "byDate"] as const,
  },
} as const;
