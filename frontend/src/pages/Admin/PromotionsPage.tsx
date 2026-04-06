import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api";
import {
  type PromotionRecord,
  useAdminPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from "@/hooks/useStoreData";

type PromotionFormState = {
  name: string;
  description: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  autoApply: boolean;
  isActive: boolean;
  minSubtotal: string;
  firstOrderOnly: boolean;
  usageLimit: string;
  perUserLimit: string;
};

const EMPTY_FORM: PromotionFormState = {
  name: "",
  description: "",
  code: "",
  type: "percentage",
  value: "10",
  autoApply: false,
  isActive: true,
  minSubtotal: "0",
  firstOrderOnly: false,
  usageLimit: "",
  perUserLimit: "",
};

const toFormState = (promotion: PromotionRecord): PromotionFormState => ({
  name: promotion.name,
  description: promotion.description || "",
  code: promotion.code || "",
  type: promotion.type,
  value: String(promotion.value),
  autoApply: promotion.autoApply,
  isActive: promotion.isActive,
  minSubtotal: String(promotion.minSubtotal ?? 0),
  firstOrderOnly: promotion.firstOrderOnly,
  usageLimit: promotion.usageLimit ? String(promotion.usageLimit) : "",
  perUserLimit: promotion.perUserLimit ? String(promotion.perUserLimit) : "",
});

const buildPayload = (state: PromotionFormState) => ({
  name: state.name.trim(),
  description: state.description.trim(),
  code: state.code.trim() || null,
  type: state.type,
  value: Number(state.value || 0),
  autoApply: state.autoApply,
  isActive: state.isActive,
  minSubtotal: Number(state.minSubtotal || 0),
  firstOrderOnly: state.firstOrderOnly,
  usageLimit: state.usageLimit ? Number(state.usageLimit) : null,
  perUserLimit: state.perUserLimit ? Number(state.perUserLimit) : null,
});

export default function PromotionsPage() {
  const [formState, setFormState] = useState<PromotionFormState>(EMPTY_FORM);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const promotionsQuery = useAdminPromotionsQuery();
  const createPromotionMutation = useCreatePromotionMutation();
  const updatePromotionMutation = useUpdatePromotionMutation();

  const promotions = promotionsQuery.data?.data || [];
  const loading = promotionsQuery.isPending;

  const orderedPromotions = useMemo(
    () =>
      [...promotions].sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }),
    [promotions]
  );

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      toast.error("Promotion name is required");
      return;
    }

    if (!formState.autoApply && !formState.code.trim()) {
      toast.error("Coupon-style promotions need a code");
      return;
    }

    try {
      const payload = buildPayload(formState);

      if (editingPromotionId) {
        await updatePromotionMutation.mutateAsync({
          promotionId: editingPromotionId,
          payload,
        });
        toast.success("Promotion updated");
      } else {
        await createPromotionMutation.mutateAsync(payload);
        toast.success("Promotion created");
      }

      setFormState(EMPTY_FORM);
      setEditingPromotionId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save promotion"));
    }
  };

  const handleEdit = (promotion: PromotionRecord) => {
    setEditingPromotionId(promotion._id);
    setFormState(toFormState(promotion));
  };

  const handleToggleActive = async (promotion: PromotionRecord) => {
    try {
      await updatePromotionMutation.mutateAsync({
        promotionId: promotion._id,
        payload: { isActive: !promotion.isActive },
      });
      toast.success(`Promotion ${promotion.isActive ? "disabled" : "enabled"}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update promotion"));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingPromotionId ? "Edit Promotion" : "Create Promotion"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Promotion name"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Input
              placeholder="Coupon code"
              value={formState.code}
              onChange={(event) =>
                setFormState((current) => ({ ...current, code: event.target.value.toUpperCase() }))
              }
            />
            <Select
              value={formState.type}
              onValueChange={(value: PromotionFormState["type"]) =>
                setFormState((current) => ({ ...current, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Promotion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed amount</SelectItem>
                <SelectItem value="free_shipping">Free shipping</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              placeholder="Value"
              value={formState.value}
              onChange={(event) =>
                setFormState((current) => ({ ...current, value: event.target.value }))
              }
            />
            <Input
              type="number"
              min="0"
              placeholder="Minimum subtotal"
              value={formState.minSubtotal}
              onChange={(event) =>
                setFormState((current) => ({ ...current, minSubtotal: event.target.value }))
              }
            />
            <Input
              type="number"
              min="1"
              placeholder="Usage limit"
              value={formState.usageLimit}
              onChange={(event) =>
                setFormState((current) => ({ ...current, usageLimit: event.target.value }))
              }
            />
            <Input
              type="number"
              min="1"
              placeholder="Per user limit"
              value={formState.perUserLimit}
              onChange={(event) =>
                setFormState((current) => ({ ...current, perUserLimit: event.target.value }))
              }
            />
          </div>

          <Textarea
            placeholder="Description"
            value={formState.description}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between rounded border p-3 text-sm">
              <span>Auto apply campaign</span>
              <Switch
                checked={formState.autoApply}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({ ...current, autoApply: checked }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded border p-3 text-sm">
              <span>Active</span>
              <Switch
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({ ...current, isActive: checked }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded border p-3 text-sm">
              <span>First order only</span>
              <Switch
                checked={formState.firstOrderOnly}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    firstOrderOnly: checked,
                  }))
                }
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                createPromotionMutation.isPending || updatePromotionMutation.isPending
              }
            >
              {editingPromotionId ? "Update Promotion" : "Create Promotion"}
            </Button>
            {editingPromotionId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingPromotionId(null);
                  setFormState(EMPTY_FORM);
                }}
              >
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading promotions...</p>
          ) : orderedPromotions.length === 0 ? (
            <p className="text-sm text-gray-500">No promotions created yet.</p>
          ) : (
            <div className="space-y-3">
              {orderedPromotions.map((promotion) => (
                <article
                  key={promotion._id}
                  className="rounded-2xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#121212]">
                          {promotion.name}
                        </h3>
                        <Badge variant="outline">
                          {promotion.type.replace("_", " ")}
                        </Badge>
                        {promotion.code ? (
                          <Badge variant="outline">{promotion.code}</Badge>
                        ) : null}
                        {promotion.autoApply ? (
                          <Badge variant="outline">Auto</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {promotion.description || "No description"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Value: {promotion.value}</span>
                        <span>Min subtotal: LE {promotion.minSubtotal.toFixed(2)}</span>
                        <span>Used: {promotion.usageCount}</span>
                        <span>
                          First order only: {promotion.firstOrderOnly ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <span>Active</span>
                        <Switch
                          checked={promotion.isActive}
                          onCheckedChange={() => handleToggleActive(promotion)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEdit(promotion)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
