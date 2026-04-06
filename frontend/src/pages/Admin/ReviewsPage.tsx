import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api";
import {
  type AdminReviewRecord,
  useAdminReviewsQuery,
  useModerateReviewMutation,
} from "@/hooks/useStoreData";

type ReviewFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_LABELS: Record<Exclude<ReviewFilter, "all">, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_BADGE_CLASSNAMES: Record<Exclude<ReviewFilter, "all">, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const renderStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={`h-4 w-4 ${
          value <= rating ? "fill-black text-black" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

const formatReviewStatus = (status: AdminReviewRecord["status"]) =>
  STATUS_LABELS[status];

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewFilter>("pending");
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>(
    {}
  );
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const adminReviewsQuery = useAdminReviewsQuery(statusFilter);
  const moderateReviewMutation = useModerateReviewMutation();
  const reviews = adminReviewsQuery.data?.data || [];
  const totalReviews = adminReviewsQuery.data?.pagination.total || 0;

  const handleModeration = async (
    reviewId: string,
    status: "approved" | "rejected"
  ) => {
    setActiveReviewId(reviewId);

    try {
      await moderateReviewMutation.mutateAsync({
        reviewId,
        status,
        moderationNote: moderationNotes[reviewId] || "",
      });
      toast.success(
        status === "approved" ? "Review approved" : "Review rejected"
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to moderate review"));
    } finally {
      setActiveReviewId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Moderate customer feedback and publish verified-purchase reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{totalReviews} reviews</Badge>
            <Select
              value={statusFilter}
              onValueChange={(value: ReviewFilter) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter reviews" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {adminReviewsQuery.isPending ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              No reviews found for this filter.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const moderationNote =
                  moderationNotes[review._id] ?? review.moderationNote ?? "";
                const isUpdating = activeReviewId === review._id;

                return (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={STATUS_BADGE_CLASSNAMES[review.status]}
                          >
                            {formatReviewStatus(review.status)}
                          </Badge>
                          {review.verifiedPurchase ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified Purchase
                            </Badge>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          {renderStars(review.rating)}
                          <div>
                            <h3 className="text-lg font-semibold text-[#121212]">
                              {review.title || "Customer Review"}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {review.comment}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-xs font-bold tracking-wider text-gray-400">
                              CUSTOMER
                            </p>
                            <p className="mt-1 font-medium text-[#121212]">
                              {review.user?.name || review.userName || "Deleted user"}
                            </p>
                            <p>{review.user?.email || "No email available"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-wider text-gray-400">
                              PRODUCT
                            </p>
                            <p className="mt-1 font-medium text-[#121212]">
                              {review.product?.name || "Deleted product"}
                            </p>
                            <p>{review.product?.slug || "Unavailable"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-wider text-gray-400">
                              SUBMITTED
                            </p>
                            <p className="mt-1 text-[#121212]">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-wider text-gray-400">
                              MODERATED BY
                            </p>
                            <p className="mt-1 text-[#121212]">
                              {review.moderatedBy?.name || "Not moderated yet"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full max-w-md space-y-3">
                        <div>
                          <p className="mb-2 text-xs font-bold tracking-wider text-gray-400">
                            MODERATION NOTE
                          </p>
                          <Textarea
                            value={moderationNote}
                            onChange={(event) =>
                              setModerationNotes((current) => ({
                                ...current,
                                [review._id]: event.target.value,
                              }))
                            }
                            rows={4}
                            placeholder="Optional note shown internally or on rejection"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => handleModeration(review._id, "approved")}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Saving..." : "Approve"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleModeration(review._id, "rejected")}
                            disabled={isUpdating}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
