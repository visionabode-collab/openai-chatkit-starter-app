import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { ChatKit, type ChatKitOptions } from '@openai-assistants/chatkit-react';
import type { AssistantStreamEvent } from 'openai/resources/beta/assistants';
import '@openai-assistants/chatkit-react/dist/index.css';
import './ChatKitPanel.css';

// Error Boundary Component
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("ChatKit Error Boundary caught:", error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
      return null;
    }
    return this.props.children;
  }
}

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
  apiKey,
  assistantId,
  threadId,
  onThreadIdChange,
  onClose,
  isAudioEnabled,
  onAudioToggle
}: ChatKitPanelProps) {
  
  const [greeting, setGreeting] = useState("");
  const hasPlayedGreeting = useRef(false);
  const [errorCount, setErrorCount] = useState(0);

  // Time-based greeting logic
  const buildTimeGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    let prefix = "";

    if (hour >= 0 && hour <= 11) {
      prefix = "Good Morning";
    } else if (hour >= 12 && hour <= 18) {
      prefix = "Good Evening";
    } else {
      prefix = "Good Night";
    }

    return `${prefix}, welcome to the official website of WESCU. Here, a world of possibilities awaits you. We are committed to ensuring that your life is enriched with holistic prosperity, hope, and purpose. Whether you're exploring financial solutions, seeking guidance, or simply learning more about our services, know that you are valued and supported every step of the way. Welcome to WESCU—where your journey toward sustainable success begins. How may I help you today?`;
  };

  useEffect(() => {
    const timeGreeting = buildTimeGreeting();
    setGreeting(timeGreeting);

    // Greet once per open
    if (isAudioEnabled && !hasPlayedGreeting.current) {
      hasPlayedGreeting.current = true;
      console.log("🟢 Greeting triggered (text-only).");
    }
  }, [isAudioEnabled]);

  const handleAudioToggle = () => {
    onAudioToggle();
  };

  const handleErrorBoundary = () => {
    setErrorCount((prev) => prev + 1);
    if (errorCount > 5) {
      console.error("Too many ChatKit errors.");
    }
  };

  const chatOptions: ChatKitOptions = {
    apiKey,
    assistantId,
    threadId: threadId ?? undefined,
    greeting,

    onError: ({ error }: { error: unknown }) => {
      console.warn("ChatKit error suppressed:", error);
      return;
    },

    onThreadEvent: (event: AssistantStreamEvent) => {
      try {
        if (event.event === "thread.created" && "data" in event && event.data?.id) {
          const newThreadId = event.data.id;
          console.log("Chat session stored:", newThreadId);
          onThreadIdChange(newThreadId);

          try {
            localStorage.setItem("chatThreadId", newThreadId);
          } catch (e) {
            console.warn("Failed to save threadId:", e);
          }
        }
      } catch (error) {
        console.warn("Thread event error suppressed:", error);
      }
    },

    onStateChange: (state: any) => {
      try {
        if (state.error) {
          console.warn("ChatKit internal error suppressed:", state.error);
        }
      } catch (error) {
        console.warn("State change handler error suppressed:", error);
      }
    }
  };

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
          onClick={handleAudioToggle}
          title={isAudioEnabled ? "Mute Audio" : "Enable Audio"}
        >
          <i className={`fas ${isAudioEnabled ? "fa-volume-up" : "fa-volume-mute"}`}></i>
        </button>

        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chat-body">
        <ChatKitErrorBoundary onError={handleErrorBoundary}>
          <ChatKit options={chatOptions} />
        </ChatKitErrorBoundary>
      </div>
    </div>
  );
}
