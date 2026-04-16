"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        localStorage.removeItem("bloom_anon_token");
        signOut({ callbackUrl: "/login" });
      }}
      className="rounded-full border border-[#f0d6df] px-4 py-2 text-sm font-semibold text-[#5a2d4b]"
    >
      Sign out
    </button>
  );
}
