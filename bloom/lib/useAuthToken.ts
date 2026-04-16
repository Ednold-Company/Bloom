"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthToken() {
  const { data } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const sessionToken = (data as any)?.accessToken as string | undefined;
    const anonToken = typeof window !== "undefined" ? localStorage.getItem("bloom_anon_token") : null;
    setToken(sessionToken || anonToken);
  }, [data]);

  return token;
}
