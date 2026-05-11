import React from "react";
import { Cookie, Refrigerator } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import HeaderActions from "./HeaderActions";
import DesktopNavLinks from "./DesktopNavLinks";

const Header = async () => {
  const user = await checkUser();

  return (
    <header className="fixed top-0 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-stone-50/60">
      <nav className="container mx-auto px-4 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 group"
        >
          <Image
  src="/logo.png"
  alt="Annapurna Logo"
  width={80}
  height={80}
  className="w-18 h-18 mt-1"
 />

        </Link>

        {/* Navigation Links (client-rendered) */}
        <DesktopNavLinks />

        {/* Action Buttons */}
        <HeaderActions
          subscriptionTier={user?.subscriptionTier ?? "free"}
          showPricing={Boolean(user)}
        />
      </nav>
    </header>
  );
}

export default Header;
