import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Product as CatalogProduct } from "@/components/ProductCard";
import { apiRequest } from "@/lib/api";
import { getAnalyticsSessionId } from "@/lib/analytics";
import { queryKeys } from "@/lib/queryKeys";

export interface SessionUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  loyalty?: {
    pointsBalance: number;
    lifetimePoints: number;
    tier: string;
  };
}

interface SessionResponse {
  success?: boolean;
  user?: SessionUser;
  data?: SessionUser;
}

type ProductListResponse = {
  success: boolean;
  data: CatalogProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  query?: string;
  category?: {
    name: string;
    slug: string;
    description?: string;
  };
  subCategory?: {
    name: string;
    slug: string;
    description?: string;
  };
  filters?: {
    q?: string;
    sort?: string;
    category?: string;
    subCategory?: string;
    materials?: string[];
    availability?: string[];
    minPrice?: number | null;
    maxPrice?: number | null;
  };
  facets?: {
    categories: CatalogFacetOption[];
    subCategories: CatalogFacetOption[];
    materials: CatalogFacetOption[];
    availability: CatalogFacetOption[];
    priceRange: {
      min: number;
      max: number;
    };
  };
};

export interface CatalogFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogQueryInput {
  sortBy?: string;
  searchQuery?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  selectedCategory?: string;
  selectedSubCategory?: string;
  selectedMaterials?: string[];
  selectedAvailability?: string[];
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  limit?: number;
  page?: number;
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  description: string;
  metaDescription?: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  category: { name: string; slug: string } | null;
  subCategory: { name: string; slug: string } | null;
  materialVariants: {
    material: "gold" | "silver" | "stainless steel";
    metalPurity?: string;
    weight?: number;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    stock: number;
    sizeVariants: {
      label: string;
      sku: string;
      stock: number;
      price?: number;
      isAvailable: boolean;
    }[];
  }[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
}

type ProductDetailResponse = {
  success: boolean;
  data: ProductDetails;
  relatedProducts: CatalogProduct[];
};

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  name: string;
  size: string;
  material: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderRecord {
  _id: string;
  orderNumber: string;
  user: string | { name: string; email: string };
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "card" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  trackingNumber?: string;
  shippingProvider?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

type OrderListResponse = {
  success: boolean;
  data: OrderRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type OrderDetailResponse = {
  success: boolean;
  data: OrderRecord;
};

type CreateOrderInput = {
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: "card" | "paypal" | "cash_on_delivery";
  shippingCost: number;
  tax: number;
  customerNotes: string;
};

type AuthPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: SessionUser;
};

export interface CategoryRecord {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface SubCategoryRecord {
  _id: string;
  name: string;
  slug: string;
  category: CategoryRecord | string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

type CollectionResponse<T> = {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type SalesSummary = {
  totalRevenue: number;
  totalUnitsSold: number;
};

type SalesByDate = {
  _id: string;
  totalRevenue: number;
};

export interface FunnelStage {
  key: string;
  label: string;
  actors: number;
  conversionFromPrevious: number | null;
  conversionFromFirst: number | null;
}

type AnalyticsFunnelResponse = {
  success: boolean;
  data: {
    days: number;
    startDate: string;
    stages: FunnelStage[];
    overallConversionRate: number;
  };
};

export interface TopProductAnalytics {
  productId: string;
  name: string;
  slug: string;
  image: string;
  views: number;
  uniqueViewers: number;
  addToCarts: number;
  addToCartActors: number;
  unitsSold: number;
  orders: number;
  revenue: number;
  viewToCartRate: number;
  viewToPurchaseRate: number;
}

type AnalyticsTopProductsResponse = {
  success: boolean;
  data: {
    days: number;
    items: TopProductAnalytics[];
  };
};

export interface RepeatCustomerAnalytics {
  userId: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt: string;
}

type AnalyticsRepeatCustomersResponse = {
  success: boolean;
  data: {
    days: number;
    items: RepeatCustomerAnalytics[];
  };
};

export interface LowConversionPageAnalytics {
  productId: string;
  name: string;
  slug: string;
  pagePath: string;
  views: number;
  uniqueVisitors: number;
  addToCartActors: number;
  addToCartEvents: number;
  purchasedUnits: number;
  conversionRate: number;
}

type AnalyticsLowConversionPagesResponse = {
  success: boolean;
  data: {
    days: number;
    minVisitors: number;
    items: LowConversionPageAnalytics[];
  };
};

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  material: string;
  price: number;
  quantity: number;
  image: string;
}

interface ServerCartItem {
  product: {
    _id: string;
    name: string;
    images?: Array<{ url?: string }>;
  };
  size?: string;
  material?: string;
  price: number;
  quantity: number;
}

interface ServerCartResponse {
  success?: boolean;
  data?: {
    items?: ServerCartItem[];
  };
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minLifetimePoints: number;
  pointsMultiplier: number;
  birthdayBonus: number;
  benefits: string[];
}

export interface LoyaltyAction {
  id: string;
  name: string;
  points: number;
  icon: string;
  repeatable: boolean;
  claimedAt: string | null;
  isClaimed: boolean;
  canClaim: boolean;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  kind: string;
  value: number;
  affordable: boolean;
}

export interface LoyaltyHistoryEntry {
  type: string;
  direction: "earned" | "redeemed" | "reversed";
  points: number;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LoyaltyRewardRedemption {
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  code: string;
  redeemedAt: string;
  status: string;
}

export interface LoyaltyAccount {
  pointsBalance: number;
  lifetimePoints: number;
  redeemedPoints: number;
  tier: string;
  tiers: LoyaltyTier[];
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  birthday: string | null;
  availableActions: LoyaltyAction[];
  rewards: LoyaltyReward[];
  recentHistory: LoyaltyHistoryEntry[];
  rewardRedemptions: LoyaltyRewardRedemption[];
}

type LoyaltyResponse = {
  success: boolean;
  data: LoyaltyAccount;
  message?: string;
};

const normalizeCatalogSort = (sortBy = "", searchQuery = "") => {
  if (sortBy) {
    return sortBy === "best-selling" ? "popular" : sortBy;
  }

  return searchQuery.trim() ? "relevance" : "newest";
};

const appendCatalogParam = (
  params: URLSearchParams,
  key: string,
  value: string | number | null | undefined
) => {
  if (value === undefined || value === null || value === "") {
    return;
  }

  params.set(key, String(value));
};

const buildCatalogPath = ({
  sortBy = "",
  searchQuery = "",
  categorySlug = "",
  subCategorySlug = "",
  selectedCategory = "",
  selectedSubCategory = "",
  selectedMaterials = [],
  selectedAvailability = [],
  minPrice = null,
  maxPrice = null,
  limit = 20,
  page = 1,
}: CatalogQueryInput) => {
  let basePath = "/products";

  if (subCategorySlug) {
    basePath = `/products/subcategory/${subCategorySlug}`;
  } else if (categorySlug) {
    basePath = `/products/category/${categorySlug}`;
  }

  const normalizedSearchQuery = searchQuery.trim();
  const params = new URLSearchParams();

  appendCatalogParam(params, "limit", limit);
  appendCatalogParam(params, "page", page);
  appendCatalogParam(
    params,
    "sort",
    normalizeCatalogSort(sortBy, normalizedSearchQuery)
  );
  appendCatalogParam(params, "q", normalizedSearchQuery);
  appendCatalogParam(
    params,
    "category",
    categorySlug ? "" : selectedCategory
  );
  appendCatalogParam(
    params,
    "subCategory",
    subCategorySlug ? "" : selectedSubCategory
  );
  appendCatalogParam(
    params,
    "material",
    selectedMaterials.length > 0 ? selectedMaterials.join(",") : ""
  );
  appendCatalogParam(
    params,
    "availability",
    selectedAvailability.length > 0 ? selectedAvailability.join(",") : ""
  );
  appendCatalogParam(params, "minPrice", minPrice);
  appendCatalogParam(params, "maxPrice", maxPrice);

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

const mapServerCartToClientCart = (
  serverCartData: ServerCartResponse["data"] | null | undefined
): CartItem[] => {
  if (!serverCartData?.items) {
    return [];
  }

  return serverCartData.items.map((item) => ({
    id: item.product._id,
    productId: item.product._id,
    name: item.product.name,
    image:
      item.product.images?.[0]?.url ||
      "https://placehold.co/100x100/A0A0A0/ffffff?text=No+Image",
    size: item.size || "N/A",
    material: item.material || "N/A",
    price: item.price,
    quantity: item.quantity,
  }));
};

const invalidateCartQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.cart.detail,
  });
};

const invalidateLoyaltyQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.loyalty.detail,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.currentUser,
    }),
  ]);
};

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => {
      try {
        const result = await apiRequest<SessionResponse>("/users/me");
        return result.user ?? result.data ?? null;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error.status === 401 || error.status === 403 || error.status === 404)
        ) {
          return null;
        }

        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthPayload) =>
      apiRequest<AuthResponse>("/users/login", {
        method: "POST",
        json: {
          ...payload,
          sessionId: getAnalyticsSessionId(),
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser,
        }),
        invalidateCartQueries(queryClient),
        invalidateLoyaltyQueries(queryClient),
      ]);
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiRequest<AuthResponse>("/users/register", {
        method: "POST",
        json: {
          ...payload,
          sessionId: getAnalyticsSessionId(),
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser,
        }),
        invalidateCartQueries(queryClient),
        invalidateLoyaltyQueries(queryClient),
      ]);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<{ success: boolean; message: string }>("/users/logout", {
        method: "POST",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser,
        }),
        invalidateCartQueries(queryClient),
        invalidateLoyaltyQueries(queryClient),
      ]);
    },
  });
};

export const useLoyaltyQuery = () =>
  useQuery({
    queryKey: queryKeys.loyalty.detail,
    queryFn: () => apiRequest<LoyaltyResponse>("/users/loyalty"),
    select: (result) => result.data,
  });

export const useUpdateLoyaltyBirthdayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birthday: string) =>
      apiRequest<LoyaltyResponse>("/users/loyalty/birthday", {
        method: "PATCH",
        json: { birthday },
      }),
    onSuccess: async () => {
      await invalidateLoyaltyQueries(queryClient);
    },
  });
};

export const useClaimLoyaltyActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      apiRequest<LoyaltyResponse>("/users/loyalty/claim", {
        method: "POST",
        json: { activityId },
      }),
    onSuccess: async () => {
      await invalidateLoyaltyQueries(queryClient);
    },
  });
};

export const useRedeemLoyaltyRewardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) =>
      apiRequest<LoyaltyResponse>("/users/loyalty/redeem", {
        method: "POST",
        json: { rewardId },
      }),
    onSuccess: async () => {
      await invalidateLoyaltyQueries(queryClient);
    },
  });
};

export const useCartQuery = () =>
  useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: async () => {
      try {
        const result = await apiRequest<ServerCartResponse>("/cart");
        return mapServerCartToClientCart(result.data);
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error.status === 401 || error.status === 403)
        ) {
          return [];
        }

        throw error;
      }
    },
    initialData: [],
  });

export const useCartSummary = () => {
  const cartQuery = useCartQuery();
  const items = cartQuery.data || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    ...cartQuery,
    items,
    totalItems,
    subtotal,
  };
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      productId: string;
      quantity: number;
      size: string;
      material: string;
    }) =>
      apiRequest("/cart/items", {
        method: "POST",
        json: {
          ...payload,
          sessionId: getAnalyticsSessionId(),
        },
      }),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
};

export const useUpdateCartItemQuantityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      size,
      material,
      delta,
    }: {
      productId: string;
      size: string;
      material: string;
      delta: number;
    }) =>
      apiRequest(`/cart/items/${productId}`, {
        method: "PUT",
        json: { size, material, delta },
      }),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      size,
      material,
    }: {
      productId: string;
      size: string;
      material: string;
    }) =>
      apiRequest(`/cart/items/${productId}`, {
        method: "DELETE",
        json: { size, material },
      }),
    onSuccess: async () => {
      await invalidateCartQueries(queryClient);
    },
  });
};

export const useCatalogProductsQuery = (input: CatalogQueryInput) =>
  useQuery({
    queryKey: queryKeys.products.list("catalog", {
      ...input,
    }),
    queryFn: () => apiRequest<ProductListResponse>(buildCatalogPath(input)),
    placeholderData: keepPreviousData,
  });

export const useProductsQuery = (
  sortBy: string,
  searchQuery = "",
  limit = 20
) =>
  useCatalogProductsQuery({
    sortBy,
    searchQuery,
    limit,
  });

export const useCategoryProductsQuery = (
  categorySlug: string,
  sortBy: string,
  limit = 20,
  options: Omit<CatalogQueryInput, "sortBy" | "categorySlug" | "limit"> = {}
) =>
  useCatalogProductsQuery({
    ...options,
    categorySlug,
    sortBy,
    limit,
  });

export const useSubCategoryProductsQuery = (
  subCategorySlug: string,
  sortBy: string,
  limit = 20,
  options: Omit<CatalogQueryInput, "sortBy" | "subCategorySlug" | "limit"> = {}
) =>
  useCatalogProductsQuery({
    ...options,
    subCategorySlug,
    sortBy,
    limit,
  });

export const useProductDetailQuery = (slug: string) =>
  useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => apiRequest<ProductDetailResponse>(`/products/${slug}`),
    enabled: Boolean(slug),
  });

export const useMyOrdersQuery = (page: number, limit: number) =>
  useQuery({
    queryKey: queryKeys.orders.mine(page, limit),
    queryFn: () =>
      apiRequest<OrderListResponse>(`/orders?page=${page}&limit=${limit}`),
    placeholderData: keepPreviousData,
  });

export const useOrderDetailQuery = (orderId: string | null) =>
  useQuery({
    queryKey: queryKeys.orders.detail(orderId || ""),
    queryFn: () =>
      apiRequest<OrderDetailResponse>(`/orders/${orderId}`),
    enabled: Boolean(orderId),
  });

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderInput) =>
      apiRequest<OrderDetailResponse>("/orders", {
        method: "POST",
        json: {
          ...payload,
          sessionId: getAnalyticsSessionId(),
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.mine(1, 10).slice(0, 2),
        }),
        invalidateCartQueries(queryClient),
        invalidateLoyaltyQueries(queryClient),
      ]);
    },
  });
};

export const useAdminOrdersQuery = (limit?: number) =>
  useQuery({
    queryKey: queryKeys.orders.admin(limit),
    queryFn: () =>
      apiRequest<OrderListResponse>(
        `/orders/admin/all${limit ? `?limit=${limit}` : ""}`
      ),
    placeholderData: keepPreviousData,
  });

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) =>
      apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        json: { status },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.admin().slice(0, 2),
      });
    },
  });
};

export const useUpdatePaymentStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      paymentStatus,
    }: {
      orderId: string;
      paymentStatus: string;
    }) =>
      apiRequest(`/orders/${orderId}/payment-status`, {
        method: "PATCH",
        json: { paymentStatus },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.admin().slice(0, 2),
      });
    },
  });
};

export const useAdminUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () =>
      apiRequest<CollectionResponse<SessionUser>>("/users/admin/all"),
  });

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/users/admin/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users,
      });
    },
  });
};

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () =>
      apiRequest<CollectionResponse<CategoryRecord>>("/categories"),
  });

export const useSubCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.admin.subCategories,
    queryFn: () =>
      apiRequest<CollectionResponse<SubCategoryRecord>>("/subcategories"),
  });

const invalidateCategoryQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories }),
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.subCategories }),
  ]);
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      apiRequest("/categories", {
        method: "POST",
        json: payload,
      }),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
};

export const useCreateSubCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) =>
      apiRequest("/subcategories", {
        method: "POST",
        json: payload,
      }),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: unknown;
    }) =>
      apiRequest(`/categories/${categoryId}`, {
        method: "PUT",
        json: payload,
      }),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
};

export const useUpdateSubCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subCategoryId,
      payload,
    }: {
      subCategoryId: string;
      payload: unknown;
    }) =>
      apiRequest(`/subcategories/${subCategoryId}`, {
        method: "PUT",
        json: payload,
      }),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
};

export const useDeleteSubCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subCategoryId: string) =>
      apiRequest(`/subcategories/${subCategoryId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
};

export const useAdminDashboardQueries = () => {
  const analyticsDays = 30;
  const topProductsLimit = 5;
  const repeatCustomersLimit = 5;
  const lowConversionLimit = 5;
  const minVisitors = 10;

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.admin.salesSummary,
        queryFn: () => apiRequest<SalesSummary>("/sales/summary"),
      },
      {
        queryKey: queryKeys.admin.salesByDate,
        queryFn: () => apiRequest<SalesByDate[]>("/sales/by-date"),
      },
      {
        queryKey: queryKeys.orders.admin(5),
        queryFn: () => apiRequest<OrderListResponse>("/orders/admin/all?limit=5"),
      },
      {
        queryKey: queryKeys.admin.users,
        queryFn: () =>
          apiRequest<CollectionResponse<SessionUser>>("/users/admin/all?limit=1"),
      },
      {
        queryKey: queryKeys.products.list("admin-dashboard", { limit: 20 }),
        queryFn: () => apiRequest<ProductListResponse>("/products"),
      },
      {
        queryKey: queryKeys.admin.categories,
        queryFn: () =>
          apiRequest<CollectionResponse<CategoryRecord>>("/categories"),
      },
      {
        queryKey: queryKeys.admin.analytics.funnel(analyticsDays),
        queryFn: () =>
          apiRequest<AnalyticsFunnelResponse>(
            `/analytics/funnel?days=${analyticsDays}`
          ),
      },
      {
        queryKey: queryKeys.admin.analytics.topProducts(
          analyticsDays,
          topProductsLimit
        ),
        queryFn: () =>
          apiRequest<AnalyticsTopProductsResponse>(
            `/analytics/top-products?days=${analyticsDays}&limit=${topProductsLimit}`
          ),
      },
      {
        queryKey: queryKeys.admin.analytics.repeatCustomers(
          analyticsDays,
          repeatCustomersLimit
        ),
        queryFn: () =>
          apiRequest<AnalyticsRepeatCustomersResponse>(
            `/analytics/repeat-customers?days=${analyticsDays}&limit=${repeatCustomersLimit}`
          ),
      },
      {
        queryKey: queryKeys.admin.analytics.lowConversionPages(
          analyticsDays,
          lowConversionLimit,
          minVisitors
        ),
        queryFn: () =>
          apiRequest<AnalyticsLowConversionPagesResponse>(
            `/analytics/low-conversion-pages?days=${analyticsDays}&limit=${lowConversionLimit}&minVisitors=${minVisitors}`
          ),
      },
    ],
  });

  return {
    summaryQuery: results[0],
    salesByDateQuery: results[1],
    ordersQuery: results[2],
    usersQuery: results[3],
    productsQuery: results[4],
    categoriesQuery: results[5],
    funnelQuery: results[6],
    topProductsQuery: results[7],
    repeatCustomersQuery: results[8],
    lowConversionPagesQuery: results[9],
  };
};
