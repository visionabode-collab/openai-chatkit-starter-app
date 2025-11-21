/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

interface ChatKitPanelProps {
  apiKey: string;
  assistantId: string;
  threadId: string | null;
  onThreadIdChange: (threadId: string) => void;
  onClose: () => void;
  isAudioEnabled: boolean;
  onAudioToggle: () => void;
}

export default function ChatKitPanel({
  threadId,
  onThreadIdChange,
  onClose,
  isAudioEnabled,
  onAudioToggle,
}: ChatKitPanelProps) {
  const played = useRef(false);

  // ✅ FIXED ChatKit hook — correct return format for client_secret
  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        // 👇👇 REQUIRED FORMAT — this fixes "Invalid client secret format"
        return {
          type: "client_secret",
          value: data.client_secret,
        };
      },
    },

    onThreadChange: ({ threadId: newThreadId }: { threadId: string | null }) => {
      if (newThreadId) {
        console.log("Thread changed:", newThreadId);
        onThreadIdChange(newThreadId);

        try {
          localStorage.setItem("chatThreadId", newThreadId);
        } catch (e) {
          console.warn("Failed to save thread ID:", e);
        }
      }
    },
  });

  // Load existing thread on mount
  useEffect(() => {
    if (threadId) {
      setThreadId(threadId).catch((err: any) =>
        console.warn("Failed to set thread:", err)
      );
    }
  }, [threadId, setThreadId]);

  // Audio greeting logic placeholder
  useEffect(() => {
    if (isAudioEnabled && !played.current) {
      played.current = true;
      console.log("Greeting would trigger here (text only)");
    }
  }, [isAudioEnabled]);

  return (
    <div className="chat-panel">
      {
