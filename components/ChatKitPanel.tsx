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

import { ChatKit, type ChatKitOptions } from "@openai/chatkit-react";

// ----------------------------------------------------
// ERROR BOUNDARY TO STOP CHATKIT CRASH FREEZES
// ----------------------------------------------------
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
    console.warn("🔥 ChatKit ErrorBoundary caught:", error, info);
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

// ----------------------------------------------------
// PROPS
// ----------------------------------------------------
interface ChatKitPanelProps {
  apiKey: string;
  assistantId: string;
  threadId: string | null;
  onThreadIdChange: (threadId: string) => void;
  onClose: () => void;
  isAudioEnabled: boolean;
  onAudioToggle: () => void;
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function ChatKitPanel({
  apiKey,
  assistantId,
  threadId,
  onThreadIdChange,
  onClose,
  isAudioEnabled,
  onAudioToggle,
}: ChatKitPanelProps) {
  const [greeting, setGreeting] = useState("");
  const played = useRef(false);

  // Auto-generate greeting text
  const buildGreeting = () => {
    const hour = new Date().getHours();
    const prefix =
      hour < 12
        ? "Good Morning"
        : hour < 17
        ? "Good Afternoon"
        : "Good Evening";

    return `${prefix}, welcome to WESCU. How may I assist you today?`;
  };

  useEffect(() => {
    setGreeting(buildGreeting());

    if (isAudioEnabled && !played.current) {
      played.current = true;
      console.log("Greeting logged (no audio)");
    }
  }, [isAudioEnabled]);

  // ----------------------------------------------------
  // VALID ChatKitOptions (NO assistantId/apiKey/threadId HERE)
  // ----------------------------------------------------
  const options: ChatKitOptions = {
    greeting,

    onError: ({ error }) => {
      console.warn("⚠️ ChatKit suppressed error:", error);
    },

    onThreadEvent: (event: any) => {
      try {
        if (event?.event === "thread.created" && event?.data?.id) {
          onThreadIdChange(event.data.id);
          localStorage.setItem("chatThreadId", event.data.id);
        }
      } catch (err) {
        console.warn("⚠️ Thread event suppressed:", err);
      }
    },

    onStateChange: (state: any) => {
      if (state?.error) {
        console.warn("⚠️ ChatKit state error suppressed:", state.error);
      }
    },
  };

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

        {/* AUDIO TOGGLE (just UI toggle now) */}
        <button
          className={`audio-toggle-btn ${isAudioEnabled ? "active" : ""}`}
          onClick={onAudioToggle}
        >
          <i className={`fas ${isAudioEnabled ? "fa-volume-up" : "fa-volume-mute"}`} />
        </button>

        {/* CLOSE */}
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
      </div>

      {/* BODY */}
      <div className="chat-body">
        <ChatKitErrorBoundary onError={() => console.warn("BOUNDARY RECOVERED")}>
          <ChatKit
            apiKey={apiKey}
            assistantId={assistantId}
            threadId={threadId ?? undefined}
            options={options}
          />
        </ChatKitErrorBoundary>
      </div>
    </div>
  );
}
