import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  useAddToWishlistMutation,
  useCurrentUserQuery,
  useRemoveFromWishlistMutation,
  useWishlistSummary,
} from "@/hooks/useStoreData";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
};

export default function WishlistButton({
  productId,
  className = "",
  iconClassName = "",
  onClick,
}: WishlistButtonProps) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUserQuery();
  const { productIds } = useWishlistSummary();
  const addToWishlistMutation = useAddToWishlistMutation();
  const removeFromWishlistMutation = useRemoveFromWishlistMutation();
  const isSaved = productIds.has(productId);
  const isPending =
    addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();

    if (!currentUser) {
      navigate("/auth?mode=login");
      return;
    }

    try {
      if (isSaved) {
        await removeFromWishlistMutation.mutateAsync(productId);
        toast.success("Removed from wishlist");
        return;
      }

      await addToWishlistMutation.mutateAsync(productId);
      toast.success("Saved to wishlist");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update wishlist"));
    }
  };

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-full border border-black/10 bg-white/90 p-2 text-black shadow-sm transition hover:scale-105 hover:bg-white disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition ${
          isSaved ? "fill-black text-black" : "text-black"
        } ${iconClassName}`}
      />
    </button>
  );
}
