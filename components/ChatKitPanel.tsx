"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { ChatKit } from "@openai/chatkit-react";
import {
  STARTER_PROMPTS,
  PLACEHOLDER_INPUT,
  GREETING,
  CREATE_SESSION_ENDPOINT,
  WORKFLOW_ID,
  getThemeConfig
} from "@/lib/config";
import { ErrorOverlay } from "./ErrorOverlay";
import type { ColorScheme } from "@/hooks/useColorScheme";

export type FactAction = {
  type: "save";
  factId: string;
  factText: string;
};

type ChatKitPanelProps = {
  theme: ColorScheme;
  onWidgetAction: (action: FactAction) => Promise<void>;
  onResponseEnd: () => void;
  onThemeRequest: (scheme: ColorScheme) => void;
};

type ErrorState = {
  script: string | null;
  session: string | null;
  integration: string | null;
};

const SESSION_KEY = 'wescu_chat_session_v1';

export function ChatKitPanel({
  theme,
  onWidgetAction,
  onResponseEnd,
  onThemeRequest
}: ChatKitPanelProps) {
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<ErrorState>({
    script: null,
    session: null,
    integration: null
  });

  // Custom session creation with persistence
  const createSessionWithPersistence = useCallback(async () => {
    // Try to get existing session from localStorage
    const savedSession = typeof window !== 'undefined' 
      ? localStorage.getItem(SESSION_KEY) 
      : null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // If we have a saved session, try to resume it
      if (savedSession) {
        headers['x-session-id'] = savedSession;
        console.log('🔄 Attempting to resume chat session');
      } else {
        console.log('🆕 Creating new chat session');
      }

      const response = await fetch(CREATE_SESSION_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          workflow: { id: WORKFLOW_ID },
          chatkit_configuration: {
            file_upload: {
              enabled: true,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Session API error: ${response.status}`);
      }

      const data = await response.json();
      const sessionId = data.client_secret;

      // Save session to localStorage
      if (sessionId && typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, sessionId);
        console.log('💾 Chat session saved');
      }

      return sessionId;
    } catch (err) {
      console.error('Session creation error:', err);
      // If resume fails, clear storage and try creating new session
      if (savedSession && typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
        console.log('❌ Session resume failed, starting fresh');
        return createSessionWithPersistence();
      }
      throw err;
    }
  }, []);

  // Remove top spacing
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.style.marginTop = "0px";
      container.style.paddingTop = "0px";
      
      setTimeout(() => {
        const internal = container.querySelector("openai-chatkit");
        if (internal) {
          (internal as HTMLElement).style.marginTop = "0px";
          (internal as HTMLElement).style.paddingTop = "0px";
        }
      }, 50);
    }
  }, []);

  const handleFactAction = useCallback(
    async (payload: { action?: FactAction }) => {
      if (!payload?.action) return;
      if (payload.action.type === "save") {
        await onWidgetAction(payload.action);
      }
    },
    [onWidgetAction]
  );

  const handleThemeChange = useCallback(
    (payload: { scheme?: ColorScheme }) => {
      if (payload?.scheme) {
        onThemeRequest(payload.scheme);
      }
    },
    [onThemeRequest]
  );

  const handleMessagesEnd = useCallback(() => {
    onResponseEnd();
  }, [onResponseEnd]);

  const handleError = useCallback(
    (payload: { type?: string; error?: string }) => {
      if (payload.type === "script_error") {
        setError((prev) => ({ ...prev, script: payload.error || null }));
      } else if (payload.type === "session_error") {
        setError((prev) => ({ ...prev, session: payload.error || null }));
      } else if (payload.type === "integration_error") {
        setError((prev) => ({ ...prev, integration: payload.error || null }));
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        margin: 0,
        padding: 0
      }}
    >
      {error.script || error.session || error.integration ? (
        <ErrorOverlay
          script={error.script}
          session={error.session}
          integration={error.integration}
        />
      ) : null}
      <ChatKit
        workflow={WORKFLOW_ID}
        theme={getThemeConfig(theme)}
        starterPrompts={STARTER_PROMPTS}
        placeholder={PLACEHOLDER_INPUT}
        greeting={GREETING}
        getClientSecret={createSessionWithPersistence}
        onWidgetAction={handleFactAction}
        onMessagesEnd={handleMessagesEnd}
        onThemeRequest={handleThemeChange}
        onError={handleError}
        style={{
          width: "100%",
          height: "100%",
          marginTop: 0,
          paddingTop: 0
        }}
      />
    </div>
  );
}
