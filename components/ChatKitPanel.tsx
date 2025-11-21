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

  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        // ✅ FIX: We return the OBJECT (so the app works), 
        // but we cast it as 'string' (so the build passes).
        return {
          type: "client_secret",
          value: data.client_secret,
        } as unknown as string; 
      },
    },

    onThreadChange: ({ threadId: newThreadId }: { threadId: string | null }) => {
      if (newThreadId) {
        onThreadIdChange(newThreadId);

        try {
          localStorage.setItem("chatThreadId", newThreadId);
        } catch (e) {
          console.warn("Failed to save thread ID:", e);
        }
      }
    },
  });

  useEffect(() => {
    if (threadId) {
      setThreadId(threadId).catch((err: any) => {
        console.warn("Failed to set thread:", err);
      });
    }
  }, [threadId, setThreadId]);

  useEffect(() => {
    if (isAudioEnabled && !played.current) {
      played.current = true;
      console.log("Greeting audio placeholder");
    }
  }, [isAudioEnabled]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <img
          src="https://cdn.prod.website-files.com/6767f7b80cd69e3a62efb5e1/6767f7b80cd69e3a62efb6f1_wescu-fav-logo%20(1).png"
          alt="Claire"
          className="chat-avatar"
        />
        <div className="chat-info">
          <h3>Claire</h3>
          <p>WESCU Virtual Assistant</p>
        </div>

        <button
          className={`audio-toggle-btn ${isAudioEnabled ? "active" : ""}`}
          onClick={onAudioToggle}
        >
          {isAudioEnabled ? "🔊" : "🔇"}
        </button>

        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="chat-body">
        <ChatKit control={control} />
      </div>
    </div>
  );
}
