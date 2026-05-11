"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SupportNavLink({ className = "" }) {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSupport = () => {
    const el = document.getElementById("support-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Close any mobile nav if present
    try {
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.remove("open");
      }
    } catch (err) {
      // ignore
    }

    if (pathname === "/") {
      scrollToSupport();
    } else {
      // Navigate to home then scroll after render
      await router.push("/");
      // Wait a short time for the content to mount then scroll
      setTimeout(() => scrollToSupport(), 250);
    }
  };

  return (
    <a
      href="/#support-section"
      onClick={handleClick}
      className={"hover:text-orange-600 transition-colors cursor-pointer " + className}
      aria-label="Support the project"
    >
      Support ❤️
    </a>
  );
}
