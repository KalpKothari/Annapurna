"use client";

import dynamic from "next/dynamic";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import UserDropdown from "./UserDropdown";
import SupportNavLink from "./SupportNavLink";

const PricingModal = dynamic(() => import("./PricingModal"), {
  ssr: false,
});

const HowToCookModal = dynamic(() => import("./HowToCookModal"), {
  ssr: false,
});

export default function HeaderActions({ subscriptionTier = "free", showPricing = false }) {
  return (
    <div className="flex items-center space-x-4">
      <HowToCookModal />

      <SignedIn>
        {showPricing && (
          <PricingModal subscriptionTier={subscriptionTier}>
            <Badge
              variant="outline"
              className={`flex h-8 px-3 gap-1.5 rounded-full text-xs font-semibold transition-all ${
                subscriptionTier === "pro"
                  ? "bg-linear-to-r from-orange-600 to-amber-500 text-white border-none shadow-sm"
                  : "bg-stone-200/50 text-stone-600 border-stone-200 cursor-pointer hover:bg-stone-300/50 hover:border-stone-300"
              }`}
            >
              <Sparkles
                className={`h-3 w-3 ${
                  subscriptionTier === "pro"
                    ? "text-white fill-white/20"
                    : "text-stone-500"
                }`}
              />
              <span>{subscriptionTier === "pro" ? "Pro Chef" : "Free Plan"}</span>
            </Badge>
          </PricingModal>
        )}

        <UserDropdown />
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 font-medium"
          >
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="primary" className="rounded-full px-6">
            Get Started
          </Button>
        </SignUpButton>
      </SignedOut>
    </div>
  );
}