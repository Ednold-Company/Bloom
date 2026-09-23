export type StickerItem = {
  id: string;
  emoji: string;
  label: string;
  category: "mood" | "symptom" | "vibe";
  color: string;
  description: string;
};

export const BLOOM_STICKERS: StickerItem[] = [
  { id: "radiant", emoji: "🌸", label: "Radiant", category: "mood", color: "#ff6584", description: "Feeling glowing & vibrant" },
  { id: "cozy", emoji: "🧸", label: "Cozy", category: "vibe", color: "#f59e0b", description: "Soft blankets & warm tea" },
  { id: "energetic", emoji: "⚡", label: "High Energy", category: "vibe", color: "#10b981", description: "Ready to conquer the world" },
  { id: "cravings", emoji: "🍫", label: "Cravings", category: "symptom", color: "#8b5cf6", description: "Sweet treats & snacks needed" },
  { id: "romantic", emoji: "💖", label: "Romantic", category: "mood", color: "#ec4899", description: "Playful, loving & affectionate" },
  { id: "sensitive", emoji: "🥺", label: "Sensitive", category: "mood", color: "#6366f1", description: "Soft-hearted & emotional" },
  { id: "bloated", emoji: "🫧", label: "Bloated", category: "symptom", color: "#06b6d4", description: "Gentle stretches & hydration" },
  { id: "sleepy", emoji: "😴", label: "Sleepy", category: "symptom", color: "#64748b", description: "Ready for deep cozy sleep" },
  { id: "selfcare", emoji: "💆‍♀️", label: "Self Care", category: "vibe", color: "#f43f5e", description: "Face masks, baths & rest" },
  { id: "peaceful", emoji: "🧘‍♀️", label: "Peaceful", category: "mood", color: "#14b8a6", description: "Calm, grounded & centered" },
  { id: "period_light", emoji: "💧", label: "Light Flow", category: "symptom", color: "#f43f5e", description: "Spotting or light bleeding" },
  { id: "crampy", emoji: "🩹", label: "Crampy", category: "symptom", color: "#e11d48", description: "Warm compress & gentle care" },
  { id: "radiant", emoji: "🌸", label: "Radiant", category: "mood", color: "#ff6584", description: "Glowing & vibrant" },
  { id: "cozy", emoji: "🧸", label: "Cozy", category: "vibe", color: "#f59e0b", description: "Warm tea & restful" },
  { id: "energetic", emoji: "⚡", label: "High Energy", category: "vibe", color: "#10b981", description: "Productive & active" },
  { id: "romantic", emoji: "💖", label: "Romantic", category: "mood", color: "#ec4899", description: "Affectionate & playful" },
  { id: "peaceful", emoji: "🧘‍♀️", label: "Peaceful", category: "mood", color: "#14b8a6", description: "Calm & centered" },
  { id: "crampy", emoji: "🩹", label: "Crampy", category: "symptom", color: "#e11d48", description: "Warm compress & gentle rest" },
];

export function getStickerById(id: string): StickerItem | undefined {
  return BLOOM_STICKERS.find((s) => s.id === id || s.label.toLowerCase() === id.toLowerCase());
}
