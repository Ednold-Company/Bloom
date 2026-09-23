"use client";

import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import { createChatBotMessage, createClientMessage } from "react-chatbot-kit";
import { useEffect, useMemo, useState } from "react";
import { createConfig } from "./config";
import ActionProvider from "./ActionProvider";
import MessageParser from "./MessageParser";
import { useAuthToken } from "@/lib/useAuthToken";
import api from "@/lib/api";

export default function BloomChatbot() {
  const token = useAuthToken();
  const [messageHistory, setMessageHistory] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory(activeToken: string) {
      try {
        const response = await api.get("/chat/logs", {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        const logs = Array.isArray(response.data?.logs) ? response.data.logs : [];
        const messages = logs.map((log: any) =>
          log.role === "USER"
            ? (createClientMessage as any)(log.message)
            : (createChatBotMessage as any)(log.message)
        );
        if (!cancelled) {
          setMessageHistory(messages.length ? messages : undefined);
        }
      } catch {
        if (!cancelled) {
          setMessageHistory(undefined);
        }
      }
    }

    if (token) {
      loadHistory(token);
    } else {
      setMessageHistory(undefined);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  const config = useMemo(() => createConfig(token), [token]);

  return (
    <div
      className="rounded-3xl border p-3 md:p-5 glass-card shadow-lg transition-colors"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <Chatbot
        config={config}
        actionProvider={ActionProvider}
        messageParser={MessageParser}
        messageHistory={messageHistory}
      />
    </div>
  );
}
