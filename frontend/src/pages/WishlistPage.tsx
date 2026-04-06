import { useMemo, useState } from "react";
import { Heart, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { formatProductPriceRange } from "@/lib/productPricing";
import {
  useAddToCartMutation,
  useCurrentUserQuery,
  useRemoveFromWishlistMutation,
  useWishlistQuery,
  type WishlistItem,
} from "@/hooks/useStoreData";

const formatCurrency = (amount: number) =>
  `LE ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getAvailableMaterials = (item: WishlistItem) =>
  item.materialVariants.filter((materialVariant) =>
    materialVariant.sizeVariants.some((size) => size.isAvailable && size.stock > 0)
  );

const getAvailableSizes = (item: WishlistItem, material: string) => {
  const materialVariant = item.materialVariants.find(
    (variant) => variant.material === material
  );

  return (materialVariant?.sizeVariants || []).filter(
    (size) => size.isAvailable && size.stock > 0
  );
};

export default function WishlistPage() {
  const [variantPickerItemId, setVariantPickerItemId] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const { data: currentUser, isPending: isCheckingUser } = useCurrentUserQuery();
  const wishlistQuery = useWishlistQuery();
  const addToCartMutation = useAddToCartMutation();
  const removeFromWishlistMutation = useRemoveFromWishlistMutation();
  const items = wishlistQuery.data || [];
  const activeVariantItem =
    items.find((item) => item._id === variantPickerItemId) || null;

  const prompts = useMemo(() => {
    const lowStockCount = items.filter((item) => item.isLowStock).length;
    const priceDropCount = items.filter((item) => item.priceDropped).length;

    return { lowStockCount, priceDropCount };
  }, [items]);

  const openVariantPicker = (item: WishlistItem) => {
    const availableMaterials = getAvailableMaterials(item);

    if (availableMaterials.length === 0) {
      toast.error("This wishlist item is currently out of stock");
      return;
    }

    const defaultMaterial =
      selectedMaterials[item._id] || availableMaterials[0].material;
    const availableSizes = getAvailableSizes(item, defaultMaterial);
    const defaultSize = selectedSizes[item._id] || availableSizes[0]?.label || "";

    setSelectedMaterials((current) => ({
      ...current,
      [item._id]: defaultMaterial,
    }));
    setSelectedSizes((current) => ({
      ...current,
      [item._id]: defaultSize,
    }));
    setVariantPickerItemId(item._id);
  };

  const handleMaterialChange = (item: WishlistItem, material: string) => {
    const availableSizes = getAvailableSizes(item, material);

    setSelectedMaterials((current) => ({
      ...current,
      [item._id]: material,
    }));
    setSelectedSizes((current) => ({
      ...current,
      [item._id]: availableSizes[0]?.label || "",
    }));
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    const selectedMaterial = selectedMaterials[item._id];
    const selectedSize = selectedSizes[item._id];

    if (!selectedMaterial || !selectedSize) {
      toast.error("Choose a material and size first");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: item._id,
        quantity: 1,
        size: selectedSize,
        material: selectedMaterial,
      });
      await removeFromWishlistMutation.mutateAsync(item._id);
      setVariantPickerItemId(null);
      toast.success("Moved to cart");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to move item to cart"));
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove item"));
    }
  };

  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
        <div className="text-gray-500">Loading wishlist...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 px-8 py-16">
            <Heart className="mx-auto h-10 w-10 text-gray-700" />
            <h1 className="mt-6 text-3xl font-bold font-[Karla] tracking-wide uppercase">
              Your Wishlist
            </h1>
            <p className="mt-4 text-gray-600">
              Sign in to save products, track price drops, and move favorites to cart.
            </p>
            <Link
              to="/auth?mode=login"
              className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-[Karla] tracking-wide uppercase">
              Wishlist
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Save favorites, watch for price drops, and catch low-stock pieces before they go.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {prompts.lowStockCount} low-stock {prompts.lowStockCount === 1 ? "item" : "items"}
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              {prompts.priceDropCount} price-drop {prompts.priceDropCount === 1 ? "alert" : "alerts"}
            </div>
          </div>
        </div>

        {wishlistQuery.isPending ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
            Loading wishlist...
          </div>
        ) : wishlistQuery.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {getApiErrorMessage(wishlistQuery.error, "Failed to load wishlist")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-gray-500" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-3 text-gray-600">
              Save pieces from the catalog to track them here.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-gray-800"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              return (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <Link to={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={item.images[0]?.url || "https://placehold.co/600x600?text=Product"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/products/${item.slug}`}>
                          <h2 className="text-lg font-semibold text-gray-900 hover:underline">
                            {item.name}
                          </h2>
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.category?.name || "Collection"}
                          {item.subCategory?.name ? ` / ${item.subCategory.name}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item._id)}
                        className="text-sm font-medium text-gray-500 transition hover:text-black"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <p className="text-xl font-bold text-gray-900">
                        {formatProductPriceRange(item)}
                      </p>
                      {item.priceDropped ? (
                        <p className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.savedPrice)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.priceDropped ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                          <TrendingDown className="h-3.5 w-3.5" />
                          Price dropped by {formatCurrency(item.priceDropAmount)}
                        </span>
                      ) : null}
                      {item.isOutOfStock ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Out of stock
                        </span>
                      ) : item.isLowStock ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Low stock: {item.totalStock} left
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openVariantPicker(item)}
                        disabled={
                          addToCartMutation.isPending ||
                          removeFromWishlistMutation.isPending
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-gray-800 disabled:bg-gray-300"
                      >
                        Move To Cart
                      </button>
                      <Link
                        to={`/products/${item.slug}`}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-bold tracking-wider text-gray-900 transition hover:border-black"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {activeVariantItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Move To Cart
                </p>
                <h2 className="mt-2 text-2xl font-bold font-[Karla] text-gray-900">
                  {activeVariantItem.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Choose the material and size you want to add to cart.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantPickerItemId(null)}
                className="rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-gray-500">
                  MATERIAL
                </p>
                <div className="flex flex-wrap gap-2">
                  {getAvailableMaterials(activeVariantItem).map((materialVariant) => {
                    const selectedMaterial =
                      selectedMaterials[activeVariantItem._id]
                      || getAvailableMaterials(activeVariantItem)[0]?.material
                      || "";

                    return (
                      <button
                        key={materialVariant.material}
                        type="button"
                        onClick={() =>
                          handleMaterialChange(activeVariantItem, materialVariant.material)
                        }
                        className={`rounded-full border px-3 py-2 text-xs font-medium uppercase transition ${
                          selectedMaterial === materialVariant.material
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {materialVariant.material}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold tracking-wider text-gray-500">
                  SIZE
                </p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const selectedMaterial =
                      selectedMaterials[activeVariantItem._id]
                      || getAvailableMaterials(activeVariantItem)[0]?.material
                      || "";
                    const availableSizes = selectedMaterial
                      ? getAvailableSizes(activeVariantItem, selectedMaterial)
                      : [];
                    const selectedSize =
                      selectedSizes[activeVariantItem._id]
                      || availableSizes[0]?.label
                      || "";

                    return availableSizes.map((sizeVariant) => (
                      <button
                        key={sizeVariant.sku}
                        type="button"
                        onClick={() =>
                          setSelectedSizes((current) => ({
                            ...current,
                            [activeVariantItem._id]: sizeVariant.label,
                          }))
                        }
                        className={`rounded-full border px-3 py-2 text-xs font-medium uppercase transition ${
                          selectedSize === sizeVariant.label
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {sizeVariant.label}
                      </button>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleMoveToCart(activeVariantItem)}
                disabled={
                  addToCartMutation.isPending ||
                  removeFromWishlistMutation.isPending
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-gray-800 disabled:bg-gray-300"
              >
                Move To Cart
              </button>
              <button
                type="button"
                onClick={() => setVariantPickerItemId(null)}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-bold tracking-wider text-gray-900 transition hover:border-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
