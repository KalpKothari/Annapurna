import React from "react";
import { Check } from "lucide-react";
import { PricingTable, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PricingSection({ subscriptionTier = "free" }) {
  return (
    <div className="max-w-4xl">
      <div className="mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-xl text-stone-600 font-light">
          Start for free. Upgrade to become a master chef.
        </p>
      </div>

<div className="">
      <PricingTable
      checkoutProps={{
        appearance: {
            elements: {
                drawerRoot: {
                    zIndex: 2000,
                },
            },
        },
      }}
      />
</div>
      
      </div>

  );
}