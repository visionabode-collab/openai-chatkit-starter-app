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
    console.warn('ChatKit Error Boundary caught error (suppressed):', error, errorInfo);
    // Call optional error handler
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      // Reset error state after a brief delay to allow recovery
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
      return null; // Don't render anything while recovering
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
  onAudioToggle,
}: ChatKitPanelProps) {
  const [greeting, setGreeting] = useState('');
  const [isGreetingPlaying, setIsGreetingPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedGreeting = useRef(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const greetingText = `Hello! Welcome to Western United Credit Union. I'm Claire, your virtual assistant. I'm here to help you with information about our services, loans, accounts, and more. How can I assist you today?`;
    setGreeting(greetingText);

    if (isAudioEnabled && !hasPlayedGreeting.current) {
      hasPlayedGreeting.current = true;
      playGreeting(greetingText);
    }
  }, [isAudioEnabled]);

  const playGreeting = async (text: string) => {
    try {
      console.log('Playing greeting... Audio enabled:', isAudioEnabled);
      
      if (!isAudioEnabled) {
        console.log('Audio muted — greeting stopped');
        return;
      }

      setIsGreetingPlaying(true);

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pqHfZKP75CvOlQylNhV4', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': '70b1e4b77a8d8f03f3c14beb39b3d8e0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log('Greeting finished');
        setIsGreetingPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error('Audio playback error');
        setIsGreetingPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
      console.log('✅ Greeting playing!');
    } catch (error) {
      console.error('Error playing greeting:', error);
      setIsGreetingPlaying(false);
    }
  };

  const handleAudioToggle = () => {
    if (isGreetingPlaying && audioRef.current) {
      console.log('🔴 Stopping audio playback...');
      audioRef.current.pause();
      audioRef.current = null;
      setIsGreetingPlaying(false);
      console.log('Audio muted — greeting stopped');
    }
    onAudioToggle();
  };

  const handleErrorBoundary = () => {
    setErrorCount(prev => prev + 1);
    // If too many errors, could show a message or reset
    if (errorCount > 5) {
      console.error('Too many ChatKit errors, consider refreshing');
    }
  };

  const chatoptions: ChatKitOptions = {
    apiKey,
    assistantId,
    threadId: threadId ?? undefined,
    greeting,
    
    // Comprehensive error suppression
    onError: ({ error }: { error: unknown }) => {
      console.warn('ChatKit error (suppressed for stability):', error);
      // Don't throw - just log and continue
      return;
    },

    // Handle thread events with error wrapping
    onThreadEvent: (event: AssistantStreamEvent) => {
      try {
        // Wrap event handling in try-catch to prevent crashes
        if (event.event === 'thread.created' && 'data' in event && event.data?.id) {
          const newThreadId = event.data.id;
          console.log('Chat session saved:', newThreadId);
          onThreadIdChange(newThreadId);
          
          // Save to localStorage
          try {
            localStorage.setItem('chatThreadId', newThreadId);
          } catch (e) {
            console.warn('Failed to save thread ID to localStorage:', e);
          }
        }
      } catch (error) {
        // Silently catch any errors in event handling
        console.warn('Error in thread event handler (suppressed):', error);
      }
    },

    // Additional safety wrapper for all ChatKit operations
    onStateChange: (state: any) => {
      try {
        // Safely handle state changes
        if (state.error) {
          console.warn('ChatKit state error (suppressed):', state.error);
        }
      } catch (error) {
        console.warn('Error in state change handler (suppressed):', error);
      }
    },
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
          className={`audio-toggle-btn ${isAudioEnabled ? 'active' : ''}`}
          onClick={handleAudioToggle}
          title={isAudioEnabled ? "Mute Audio" : "Enable Audio"}
        >
          <i className={`fas ${isAudioEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
        </button>

        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chat-body">
        <ChatKitErrorBoundary onError={handleErrorBoundary}>
          <ChatKit options={chatoptions} />
        </ChatKitErrorBoundary>
      </div>
    </div>
  );
}
