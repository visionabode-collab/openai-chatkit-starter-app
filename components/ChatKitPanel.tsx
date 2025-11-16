"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
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
        sessionEndpoint={CREATE_SESSION_ENDPOINT}
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
