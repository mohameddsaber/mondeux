import type { Dispatch, SetStateAction } from "react";
import { Lock, User, Cake, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // import this

interface LoyaltySchemeNoAuthProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function LoyaltyScheme({ isOpen, setIsOpen }: LoyaltySchemeNoAuthProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
        {/* Accessibility: hidden dialog title */}
        <VisuallyHidden>
          <DialogTitle>Introducing Loyalty Scheme</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Introducing Loyalty Scheme</h2>

        </div>


        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          {/* Earn Points */}
          <div className="p-6 space-y-5">
            <h3 className="font-medium text-lg">
              Earn points when you complete activities
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Lock className="w-6 h-6" />
                <div>
                  <p className="font-medium">Make a purchase</p>
                  <p className="text-sm text-gray-500">
                    1 point per £1 (LE 65.44 EGP)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <User className="w-6 h-6" />
                <div>
                  <p className="font-medium">Create an account</p>
                  <p className="text-sm text-gray-500">5 points</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Cake className="w-6 h-6" />
                <div>
                  <p className="font-medium">Happy Birthday</p>
                  <p className="text-sm text-gray-500">10 points</p>
                </div>
              </div>
            </div>
          </div>

          {/* Redeem Points */}
          <div className="p-6 space-y-5">
            <h3 className="font-medium text-lg">
              Redeem points for rewards from Serge DeNimes
            </h3>

            <div className="space-y-4">
              {[
                { reward: "£5 voucher", points: 50 },
                { reward: "£10 voucher", points: 100 },
                { reward: "£25 voucher", points: 250 },
              ].map(({ reward, points }) => (
                <div key={reward} className="flex items-center gap-4">
                  <Gift className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{reward}</p>
                    <p className="text-sm text-gray-500">{points} points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer (Login/Signup) */}
        <div className="border-t text-center p-6 space-y-3">
          <p className="text-sm text-gray-600">
            Log in or sign up to Serge DeNimes to earn rewards today
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                navigate("/auth?mode=login");
              }}
            >
              Log in
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate("/auth?mode=signup");
              }}
            >
              Sign up
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
