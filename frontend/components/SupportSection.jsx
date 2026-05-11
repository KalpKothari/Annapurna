"use client";

import React, { useState, useEffect } from "react";
import { Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UPI_ID = "kalpkothari14@oksbi";
const MIN_AMOUNT = 10;
const PRESET_AMOUNTS = [49, 99, 199];

export default function SupportSection() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [copied, setCopied] = useState(false);

  // Detect device type on mount
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Get current amount
  const currentAmount = customAmount || selectedAmount;

  // Generate QR code when amount changes
  useEffect(() => {
    if (isDesktop && currentAmount && currentAmount >= MIN_AMOUNT) {
      const upiLink = `upi://pay?pa=${UPI_ID}&pn=Annapurna%20Support&am=${currentAmount}&cu=INR`;
      const encodedLink = encodeURIComponent(upiLink);
      // Using qrserver API for dynamic QR generation
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedLink}`);
    } else if (!currentAmount || currentAmount < MIN_AMOUNT) {
      setQrCode(null);
    }
  }, [currentAmount, isDesktop]);

  const handlePaymentClick = () => {
    const amount = customAmount || selectedAmount;

    if (!amount) {
      toast.error("Please select or enter an amount");
      return;
    }

    if (amount < MIN_AMOUNT) {
      toast.error(`Minimum amount is ₹${MIN_AMOUNT}`);
      return;
    }

    const upiLink = `upi://pay?pa=${UPI_ID}&pn=Annapurna%20Support&am=${amount}&cu=INR`;

    if (isDesktop) {
      // On desktop, QR code is already shown
      // Copy UPI link to clipboard
      navigator.clipboard.writeText(upiLink);
      toast.success("UPI link copied! Scan the QR or paste it in your UPI app");
    } else {
      // On mobile, redirect to UPI app
      window.location.href = upiLink;
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("UPI ID copied!");
  };

  const isValidAmount = currentAmount && currentAmount >= MIN_AMOUNT;

  return (
    <section id="support-section" className="py-20 px-4 bg-linear-to-br from-orange-50 to-amber-50 border-t-2 border-orange-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
            Support the Project
          </h2>
          <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto">
            If you found this tool helpful or interesting, consider supporting its development.
            Your contribution helps improve the experience and keep it accessible for everyone.
          </p>
        </div>

        {/* Main Container */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left: Amount Selection */}
          <div className="space-y-6">
            {/* Preset Amounts */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                Choose an amount
              </label>
              <div className="flex flex-col gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all text-sm ${
                      selectedAmount === amount && !customAmount
                        ? "bg-orange-600 text-white shadow-lg scale-105"
                        : "bg-white border-2 border-stone-200 text-stone-900 hover:border-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                Or enter custom amount
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Min. 10"
                    min={MIN_AMOUNT}
                    className="w-full pl-8 pr-4 py-3 border-2 border-stone-200 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 font-semibold"
                  />
                </div>
              </div>
              {customAmount && customAmount < MIN_AMOUNT && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Minimum amount is ₹{MIN_AMOUNT}
                </p>
              )}
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePaymentClick}
              disabled={!isValidAmount}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                isValidAmount
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg cursor-pointer"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {isDesktop ? "Show QR Code" : "Pay via UPI"}
            </Button>

            {/* UPI ID Display */}
            <div className="bg-white border-2 border-stone-200 rounded-lg p-4">
              <p className="text-xs text-stone-500 font-semibold mb-2">UPI ID</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-stone-900 break-all">{UPI_ID}</code>
                <button
                  onClick={handleCopyUPI}
                  className="ml-2 p-2 hover:bg-stone-100 rounded-md transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-stone-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: QR Code (Desktop Only) */}
          {isDesktop && (
            <div className="flex flex-col items-center justify-center">
              {qrCode ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white p-6 rounded-2xl border-2 border-stone-200 shadow-lg">
                    <img
                      src={qrCode}
                      alt="UPI Payment QR Code"
                      className="w-48 h-48 rounded-lg"
                    />
                    <p className="text-center mt-4 text-sm font-semibold text-stone-900">
                      Scan to Pay ₹{currentAmount}
                    </p>
                    <p className="text-center text-xs text-stone-500 mt-1">
                      Using any UPI app
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-stone-200 text-center">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 text-sm font-light">
                    Select an amount to generate QR code
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-orange-200">
          <p className="text-xs text-stone-600 text-center font-light">
            💡 <span className="font-semibold">Disclaimer:</span> This is a voluntary contribution. Payments are made directly via UPI and are not automatically verified.
          </p>
        </div>
      </div>
    </section>
  );
}
