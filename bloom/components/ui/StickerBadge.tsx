"use client";

import React from "react";
import { StickerItem } from "@/lib/stickers";

interface StickerBadgeProps {
  sticker: StickerItem;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

export default function StickerBadge({
  sticker,
  size = "md",
  selected = false,
  onClick,
}: StickerBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-4 py-3 text-base gap-2.5",
  };

  const emojiSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-xl font-bold transition-all cursor-pointer select-none active:scale-95 border ${sizeClasses[size]} ${
        selected
          ? "ring-2 ring-[#ff5277] ring-offset-1 scale-102 shadow-sm font-extrabold"
          : "hover:scale-102 hover:shadow-xs opacity-95 hover:opacity-100"
      }`}
      style={{
        backgroundColor: selected
          ? `color-mix(in srgb, ${sticker.color} 22%, var(--card))`
          : `color-mix(in srgb, ${sticker.color} 10%, var(--card))`,
        color: "var(--foreground)",
        borderColor: selected ? sticker.color : "var(--border)",
      }}
    >
      <span className={emojiSizes[size]}>
        {sticker.emoji}
      </span>
      <span className="tracking-tight">{sticker.label}</span>
    </button>
  );
}
