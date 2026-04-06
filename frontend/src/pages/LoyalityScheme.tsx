import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Award,
  Cake,
  Crown,
  Gift,
  History,
  Instagram,
  Layers,
  Mail,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  useClaimLoyaltyActivityMutation,
  useLoyaltyQuery,
  useRedeemLoyaltyRewardMutation,
  useUpdateLoyaltyBirthdayMutation,
} from "@/hooks/useStoreData";

interface LoyaltySchemeProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

type LoyaltyTab = "earn" | "rewards" | "tiers" | "history";

const activityIcons = {
  mail: Mail,
  instagram: Instagram,
  cake: Cake,
} as const;

const tabs: Array<{ id: LoyaltyTab; label: string; icon: typeof Award }> = [
  { id: "earn", label: "Earn", icon: Award },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "tiers", label: "Tiers", icon: Layers },
  { id: "history", label: "History", icon: History },
];

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function LoyaltyScheme({
  isOpen,
  setIsOpen,
}: LoyaltySchemeProps) {
  const [activeTab, setActiveTab] = useState<LoyaltyTab>("earn");
  const [birthday, setBirthday] = useState("");
  const loyaltyQuery = useLoyaltyQuery();
  const updateBirthdayMutation = useUpdateLoyaltyBirthdayMutation();
  const claimActivityMutation = useClaimLoyaltyActivityMutation();
  const redeemRewardMutation = useRedeemLoyaltyRewardMutation();

  const loyalty = loyaltyQuery.data;

  useEffect(() => {
    if (loyalty?.birthday) {
      setBirthday(loyalty.birthday.slice(0, 10));
      return;
    }

    setBirthday("");
  }, [loyalty?.birthday]);

  const tierProgress = useMemo(() => {
    if (!loyalty?.nextTier) {
      return 100;
    }

    const completed = loyalty.lifetimePoints - loyalty.currentTier.minLifetimePoints;
    const required = loyalty.nextTier.minLifetimePoints - loyalty.currentTier.minLifetimePoints;

    if (required <= 0) {
      return 100;
    }

    return Math.max(0, Math.min(100, Math.round((completed / required) * 100)));
  }, [loyalty]);

  const handleBirthdaySave = async () => {
    if (!birthday) {
      toast.error("Choose your birthday first");
      return;
    }

    try {
      const result = await updateBirthdayMutation.mutateAsync(birthday);
      toast.success(result.message || "Birthday saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save birthday"));
    }
  };

  const handleClaim = async (activityId: string) => {
    try {
      const result = await claimActivityMutation.mutateAsync(activityId);
      toast.success(result.message || "Points claimed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to claim points"));
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      const result = await redeemRewardMutation.mutateAsync(rewardId);
      toast.success(result.message || "Reward redeemed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to redeem reward"));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4">
      <div className="mx-auto flex h-full max-w-6xl items-stretch overflow-hidden rounded-3xl bg-stone-50 shadow-2xl">
        <aside className="hidden w-80 flex-col bg-black text-white md:flex">
          <div className="border-b border-white/10 px-8 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Mondeux Circle</p>
            <div className="mt-6 flex items-end gap-3">
              <div className="text-5xl font-bold font-[Karla]">
                {loyalty?.pointsBalance ?? 0}
              </div>
              <div className="pb-2 text-sm text-white/70">points</div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <Crown className="h-4 w-4" />
              <span>{loyalty?.currentTier.name || "Bronze"}</span>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                <span>Tier progress</span>
                <span>{tierProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <p className="text-sm text-white/70">
                {loyalty?.nextTier
                  ? `${Math.max(loyalty.nextTier.minLifetimePoints - loyalty.lifetimePoints, 0)} more points to ${loyalty.nextTier.name}`
                  : "Top tier unlocked"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    activeTab === tab.id ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-[Karla] text-sm font-bold tracking-wide">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 md:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Loyalty Scheme
              </p>
              <h2 className="mt-1 font-[Karla] text-2xl font-bold text-stone-900">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-black"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b border-stone-200 bg-white px-5 py-3 md:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
            {loyaltyQuery.isPending ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
                Loading your loyalty account...
              </div>
            ) : loyaltyQuery.isError || !loyalty ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
                {getApiErrorMessage(loyaltyQuery.error, "Failed to load loyalty details")}
              </div>
            ) : (
              <>
                {activeTab === "earn" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-stone-700" />
                          <h3 className="font-[Karla] text-lg font-bold">Earn more points</h3>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {loyalty.availableActions.map((action) => {
                            const Icon =
                              activityIcons[action.icon as keyof typeof activityIcons] || Award;

                            return (
                              <div
                                key={action.id}
                                className="rounded-2xl border border-stone-200 p-5"
                              >
                                <div className="flex h-full flex-col gap-4">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-5 w-5 flex-shrink-0 text-stone-700" />
                                      <h4 className="min-w-0 font-medium text-stone-900">
                                        {action.name}
                                      </h4>
                                    </div>
                                    <p className="mt-3 text-3xl font-bold text-stone-900">
                                      {action.points}
                                      <span className="ml-2 text-sm font-medium text-stone-500">
                                        pts
                                      </span>
                                    </p>
                                    <p className="mt-2 text-sm text-stone-500">
                                      {action.claimedAt
                                        ? `Last claimed ${formatDate(action.claimedAt)}`
                                        : action.id === "birthday_bonus"
                                          ? "Available on your birthday once per year"
                                        : "One-time action"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleClaim(action.id)}
                                    disabled={
                                      !action.canClaim || claimActivityMutation.isPending
                                    }
                                    className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto sm:self-start ${
                                      action.canClaim
                                        ? "bg-black text-white hover:bg-stone-800"
                                        : "bg-stone-100 text-stone-400"
                                    }`}
                                  >
                                    {action.canClaim ? "Claim" : "Unavailable"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="rounded-3xl bg-[#efe7dc] p-6 text-stone-900">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-600">
                          Birthday bonus
                        </p>
                        <h3 className="mt-3 font-[Karla] text-2xl font-bold">
                          {loyalty.currentTier.birthdayBonus} points on your birthday
                        </h3>
                        <p className="mt-3 text-sm text-stone-700">
                          Save your birthday once. If today matches it, the birthday bonus
                          claim will unlock automatically.
                        </p>

                        <label className="mt-6 block text-sm font-medium text-stone-700">
                          Birthday
                        </label>
                        <input
                          type="date"
                          value={birthday}
                          onChange={(event) => setBirthday(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-black"
                        />
                        <p className="mt-2 text-sm text-stone-600">
                          Current value: {formatDate(loyalty.birthday)}
                        </p>
                        <button
                          type="button"
                          onClick={handleBirthdaySave}
                          disabled={updateBirthdayMutation.isPending}
                          className="mt-5 w-full rounded-full bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:bg-stone-400"
                        >
                          {updateBirthdayMutation.isPending ? "Saving..." : "Save birthday"}
                        </button>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === "rewards" && (
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <section className="grid gap-4 sm:grid-cols-2">
                      {loyalty.rewards.map((reward) => (
                        <article
                          key={reward.id}
                          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200"
                        >
                          <div className="flex items-center justify-between">
                            <Gift className="h-5 w-5 text-stone-700" />
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-500">
                              {reward.pointsCost} pts
                            </span>
                          </div>
                          <h3 className="mt-5 font-[Karla] text-xl font-bold text-stone-900">
                            {reward.name}
                          </h3>
                          <p className="mt-3 text-sm text-stone-600">{reward.description}</p>
                          <button
                            type="button"
                            onClick={() => handleRedeem(reward.id)}
                            disabled={
                              !reward.affordable || redeemRewardMutation.isPending
                            }
                            className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-bold transition ${
                              reward.affordable
                                ? "bg-black text-white hover:bg-stone-800"
                                : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {reward.affordable ? "Redeem reward" : "Not enough points"}
                          </button>
                        </article>
                      ))}
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-stone-700" />
                        <h3 className="font-[Karla] text-lg font-bold">
                          Recent reward codes
                        </h3>
                      </div>
                      <div className="mt-5 space-y-3">
                        {loyalty.rewardRedemptions.length === 0 ? (
                          <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                            No redemptions yet. Redeem a reward to generate a code here.
                          </p>
                        ) : (
                          loyalty.rewardRedemptions.map((reward) => (
                            <div
                              key={`${reward.rewardId}-${reward.redeemedAt}`}
                              className="rounded-2xl border border-stone-200 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-medium text-stone-900">
                                    {reward.rewardName}
                                  </p>
                                  <p className="text-sm text-stone-500">
                                    Redeemed {formatDate(reward.redeemedAt)}
                                  </p>
                                </div>
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-500">
                                  {reward.status}
                                </span>
                              </div>
                              <div className="mt-4 rounded-2xl bg-black px-4 py-3 font-mono text-sm text-white">
                                {reward.code}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "tiers" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {loyalty.tiers.map((tier) => {
                        const isCurrent = tier.id === loyalty.currentTier.id;
                        const isNext = tier.id === loyalty.nextTier?.id;

                        return (
                          <article
                            key={tier.id}
                            className={`rounded-3xl p-6 ${
                              isCurrent
                                ? "bg-black text-white"
                                : isNext
                                  ? "bg-[#efe7dc] text-stone-900"
                                  : "bg-white text-stone-900 ring-1 ring-stone-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Crown className="h-6 w-6" />
                                <h3 className="font-[Karla] text-2xl font-bold">
                                  {tier.name}
                                </h3>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.25em] ${
                                  isCurrent
                                    ? "bg-white/15 text-white/80"
                                    : "bg-black/10 text-stone-700"
                                }`}
                              >
                                {isCurrent ? "Current" : isNext ? "Next" : "Tier"}
                              </span>
                            </div>
                            <p className={`mt-4 text-sm ${isCurrent ? "text-white/70" : "text-stone-600"}`}>
                              Unlocks from {tier.minLifetimePoints} lifetime points
                            </p>
                            <ul className="mt-5 space-y-3">
                              {tier.benefits.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-2 text-sm">
                                  <Star className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </article>
                        );
                      })}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                      <h3 className="font-[Karla] text-lg font-bold text-stone-900">
                        Account snapshot
                      </h3>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-sm text-stone-500">Points balance</p>
                          <p className="mt-2 text-3xl font-bold text-stone-900">
                            {loyalty.pointsBalance}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-sm text-stone-500">Lifetime points</p>
                          <p className="mt-2 text-3xl font-bold text-stone-900">
                            {loyalty.lifetimePoints}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-sm text-stone-500">Redeemed points</p>
                          <p className="mt-2 text-3xl font-bold text-stone-900">
                            {loyalty.redeemedPoints}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-sm text-stone-500">Birthday</p>
                          <p className="mt-2 text-lg font-semibold text-stone-900">
                            {formatDate(loyalty.birthday)}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                      <h3 className="font-[Karla] text-lg font-bold text-stone-900">
                        Recent activity
                      </h3>
                      <div className="mt-5 space-y-3">
                        {loyalty.recentHistory.length === 0 ? (
                          <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                            No loyalty activity yet. Place an order or claim an action to start.
                          </p>
                        ) : (
                          loyalty.recentHistory.map((entry) => (
                            <div
                              key={`${entry.type}-${entry.createdAt}`}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 p-4"
                            >
                              <div>
                                <p className="font-medium text-stone-900">
                                  {entry.description}
                                </p>
                                <p className="text-sm text-stone-500">
                                  {formatDate(entry.createdAt)}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-bold ${
                                  entry.direction === "earned"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : entry.direction === "reversed"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-stone-100 text-stone-700"
                                }`}
                              >
                                {entry.direction === "earned" ? "+" : "-"}
                                {entry.points}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
