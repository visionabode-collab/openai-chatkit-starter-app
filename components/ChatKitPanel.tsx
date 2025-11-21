/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useState,
  useEffect,
  useRef,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";

import { ChatKit } from "@openai/chatkit-react";

/* -------------------------------------------------------
   ERROR BOUNDARY
------------------------------------------------------- */
class ChatKitErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("ChatKit ErrorBoundary caught:", error, info);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      setTimeout(() => this.setState({ hasError: false }), 120);
      return null;
    }
    return this.props.children;
  }
}

/* -------------------------------------------------------
   PROPS
------------------------------------------------------- */
interface ChatKitPanelProps {
  apiKey: string;        // ← safe to ignore
  assistantId: string;   // ← safe to ignore
  threadId: string | null;
  onThreadIdChange: (threadId: string) => void;
  onClose: () => void;
  isAudioEnabled: boolean;
  onAudioToggle: () => void;
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */
export default function ChatKitPanel({
  apiKey,
  assistantId,
  threadId,
  onThreadIdChange,
  onClose,
  isAudioEnabled,
  onAudioToggle,
}: ChatKitPanelProps) {

  // Used only for your audio UI state
  const played = useRef(false);

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
          <i className={`fas ${isAudioEnabled ? "fa-volume-up" : "fa-volume-mute"}`} />
        </button>

        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
      </div>

      {/* BODY */}
      <div className="chat-body">
        <ChatKitErrorBoundary>
          <ChatKit
            threadId={threadId ?? undefined}
            onThreadEvent={(event: any) => {
              try {
                if (event?.event === "thread.created" && event?.data?.id) {
                  const id = event.data.id;
                  onThreadIdChange(id);
                  localStorage.setItem("chatThreadId", id);
                }
              } catch (err) {
                console.warn("Thread event suppressed:", err);
              }
            }}
            onStateChange={(state: any) => {
              if (state?.error) {
                console.warn("State error suppressed:", state.error);
              }
            }}
            onError={({ error }) => {
              console.warn("ChatKit error suppressed:", error);
            }}
          />
        </ChatKitErrorBoundary>
      </div>
    </div>
  );
}
