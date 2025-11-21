import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { ChatKit, type ChatKitOptions } from '@openai-assistants/chatkit-react';
import type { AssistantStreamEvent } from 'openai/resources/beta/assistants';
import '@openai-assistants/chatkit-react/dist/index.css';
import './ChatKitPanel.css';

/* --------------------------------------------------------
   ERROR BOUNDARY — prevents React #185 crash
-------------------------------------------------------- */
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
      // Auto-reset so chat continues working
      setTimeout(() => this.setState({ hasError: false }), 100);
      return null;
    }
    return this.props.children;
  }
}

/* --------------------------------------------------------
   PROPS
-------------------------------------------------------- */
interface ChatKitPanelProps {
  apiKey: string;
  assistantId: string;
  threadId: string | null;
  onThreadIdChange: (threadId: string) => void;
  onClose: () => void;
  isAudioEnabled: boolean;   // only controls greeting behavior
  onAudioToggle: () => void;
}

/* --------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------- */
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
  const greetingPlayedThisSession = useRef(false);
  const [errorCount, setErrorCount] = useState(0);

  /* --------------------------------------------------------
     TIME-BASED BEAUTIFUL WESCU GREETING
     • Morning / Afternoon / Night
     • Only plays ONCE per chat-window-open
-------------------------------------------------------- */
  const buildGreeting = () => {
    const hour = new Date().getHours();
    let prefix = "";

    if (hour >= 0 && hour <= 11) prefix = "Good Morning";
    else if (hour >= 12 && hour <= 17) prefix = "Good Afternoon";
    else prefix = "Good Evening";

    return `${prefix}, welcome to the official website of WESCU. Here, a world of possibilities awaits you. We are committed to ensuring that your life is enriched with holistic prosperity, hope, and purpose. Whether you're exploring financial solutions, seeking guidance, or simply learning more about our services, know that you are valued and supported every step of the way. How may I help you today?`;
  };

  /* --------------------------------------------------------
     EFFECT: Build greeting when chat window opens
-------------------------------------------------------- */
  useEffect(() => {
    const text = buildGreeting();
    setGreeting(text);

    if (isAudioEnabled && !greetingPlayedThisSession.current) {
      greetingPlayedThisSession.current = true;
      console.log("🟢 Greeting triggered (text-only, once).");
    }
  }, [isAudioEnabled]);

  /* --------------------------------------------------------
     Allow Webflow audio button to toggle greeting ability
-------------------------------------------------------- */
  const handleAudioToggle = () => {
    onAudioToggle();
  };

  /* --------------------------------------------------------
     Error Boundary counter
-------------------------------------------------------- */
  const handleErrorBoundary = () => {
    setErrorCount((n) => n + 1);
    if (errorCount > 5) console.error("Too many ChatKit errors detected.");
  };

  /* --------------------------------------------------------
     CHATKIT OPTIONS
-------------------------------------------------------- */
  const chatOptions: ChatKitOptions = {
    apiKey,
    assistantId,
    threadId: threadId ?? undefined,
    greeting,

    onError: ({ error }) => {
      console.warn("ChatKit internal error suppressed:", error);
      return;
    },

    onThreadEvent: (event: AssistantStreamEvent) => {
      try {
        if (event.event === "thread.created" && "data" in event && event.data?.id) {
          const newId = event.data.id;
          console.log("Chat session saved:", newId);
          onThreadIdChange(newId);
          localStorage.setItem("chatThreadId", newId);
        }
      } catch (e) {
        console.warn("Thread event suppressed:", e);
      }
    },

    onStateChange: (state) => {
      try {
        if (state.error) console.warn("ChatKit state error suppressed:", state.error);
      } catch (e) {
        console.warn("State handler error suppressed:", e);
      }
    }
  };

  /* --------------------------------------------------------
     JSX / LAYOUT
-------------------------------------------------------- */
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
