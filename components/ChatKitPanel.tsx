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

  // Use the NEW ChatKit API with useChatKit hook
  const { control, setThreadId } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const { client_secret } = await res.json();
        return client_secret;
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

  // Audio greeting logic
  useEffect(() => {
    if (isAudioEnabled && !played.current) {
      played.current = true;
      console.log("Greeting would trigger here (text only)");
    }
  }, [isAudioEnabled]);

  return (
    <div className="chat-panel">
      {/* HEADER */}
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
          <i
            className={`fas ${
              isAudioEnabled ? "fa-volume-up" : "fa-volume-mute"
            }`}
          />
        </button>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
      </div>

      {/* BODY */}
      <div className="chat-body">
        <ChatKit control={control} className="h-full w-full" />
      </div>
    </div>
  );
}
