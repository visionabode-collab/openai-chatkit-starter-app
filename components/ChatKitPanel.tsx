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
  // We don't even need these props anymore for UI, but keep them to prevent errors
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
          // Pass the user info
          body: JSON.stringify({ 
            user: { 
              id: guestId,
              name: "Website Visitor"
            } 
          }), 
        });

        const data = await res.json();

        // Return the Object cast as string (Our established fix)
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

  return (
    <div className="chat-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ❌ DELETED THE HEADER SECTION
         No more Image, No more "Claire" text, No more Close button.
         The Website Wrapper handles all of that.
      */}

      <div className="chat-body" style={{ flex: 1, overflow: 'hidden' }}>
        <ChatKit control={control} />
      </div>
    </div>
  );
}
