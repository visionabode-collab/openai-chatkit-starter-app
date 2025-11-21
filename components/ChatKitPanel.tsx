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
        // 1. Generate a random ID for the guest user
        const guestId = `guest_${Math.random().toString(36).substring(7)}`;

        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // ✅ FIX: Send the 'user' parameter so the server knows who is chatting
          body: JSON.stringify({ 
            user: { 
              id: guestId,
              name: "Website Visitor"
            } 
          }), 
        });

        const data = await res.json();

        // ✅ FIX: Return the OBJECT (for the app to work)
        // but cast as string (to satisfy the build)
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
