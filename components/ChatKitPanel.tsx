import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { ChatKit, type ChatKitOptions } from '@openai/chatkit-react';   // ✅ FIXED PACKAGE NAME
import type { AssistantStreamEvent } from 'openai/resources/beta/assistants';
import '@openai/chatkit-react/dist/index.css';                          // ✅ FIXED CSS IMPORT
import './ChatKitPanel.css';

// Error Boundary Component
class ChatKitErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
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
      setTimeout(() => this.setState({ hasError: false }), 100);
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
  const greetingPlayed = useRef(false);
  const [errorCount, setErrorCount] = useState(0);

  // Build greeting text
  const buildGreeting = () => {
    const hour = new Date().getHours();
    let prefix =
      hour <= 11 ? "Good Morning" :
      hour <= 17 ? "Good Afternoon" :
      "Good Evening";

    return `${prefix}, welcome to the official website of WESCU. Here, a world of possibilities awaits you. We are committed to ensuring that your life is enriched with holistic prosperity, hope, and purpose. Whether you're exploring financial solutions, seeking guidance, or learning about our services, know that you are valued every step of the way. How may I assist you today?`;
  };

  // Run greeting only once per open
  useEffect(() => {
    const msg = buildGreeting();
    setGreeting(msg);

    if (isAudioEnabled && !greetingPlayed.current) {
      greetingPlayed.current = true;
      console.log("Greeting fired (once).");
    }
  }, [isAudioEnabled]);

  const chatOptions: ChatKitOptions = {
    apiKey,
    assistantId,
    threadId: threadId ?? undefined,
    greeting,

    onError: ({ error }) => {
      console.warn("ChatKit error suppressed:", error);
    },

    onThreadEvent: (event: AssistantStreamEvent) => {
      try {
        if (event.event === "thread.created" && event.data?.id) {
          const id = event.data.id;
          onThreadIdChange(id);
          localStorage.setItem("chatThreadId", id);
        }
      } catch (err) {
        console.warn("Thread event suppressed:", err);
      }
    },

    onStateChange: (state) => {
      if (state.error) console.warn("State error suppressed:", state.error);
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

        <button className={`audio-toggle-btn ${isAudioEnabled ? "active" : ""}`} onClick={onAudioToggle}>
          <i className={`fas ${isAudioEnabled ? "fa-volume-up" : "fa-volume-mute"}`}></i>
        </button>

        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chat-body">
        <ChatKitErrorBoundary onError={() => setErrorCount(n => n + 1)}>
          <ChatKit options={chatOptions} />
        </ChatKitErrorBoundary>
      </div>
    </div>
  );
}
