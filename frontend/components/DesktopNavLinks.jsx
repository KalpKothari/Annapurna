"use client";

import React from "react";
import { Cookie, Refrigerator } from "lucide-react";
import Link from "next/link";
import SupportNavLink from "./SupportNavLink";

export default function DesktopNavLinks() {
  return (
    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-600">
      <Link
        href="/recipes"
        className="hover:text-orange-600 transition-colors flex gap-1.5 items-center"
      >
        <Cookie className="w-4 h-4" />
        My Recipes
      </Link>
      <Link
        href="/pantry"
        className="hover:text-orange-600 transition-colors flex gap-1.5 items-center"
      >
        <Refrigerator className="w-4 h-4" />
        My Pantry
      </Link>
      <SupportNavLink className="flex items-center gap-1.5" />
    </div>
  );
}
