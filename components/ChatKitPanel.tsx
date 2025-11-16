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
  const chatKit = useChatKit();
  const [error, setError] = useState<ErrorState>({
    script: null,
    session: null,
    integration: null
  });

  // 🔥 FINAL FIX: Remove internal ChatKit top spacing
  useEffect(() => {
    if (!containerRef.current) return;

    const applyFix = () => {
      const ck = containerRef.current!.querySelector("openai-chatkit");
      if (ck) {
        const root = ck.shadowRoot;
        if (!root) return;

        // Inject a <style> tag directly inside shadow DOM
        const style = document.createElement("style");
        style.textContent = `
          :host {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          .chat-root, .chat-container, .message-container {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        `;
        root.appendChild(style);
      }
    };

    // Wait for shadow DOM to initialize
    const timeout = setTimeout(applyFix, 150);
    return () => clearTimeout(timeout);
  }, []);

  const handleFactAction = useCallback(
    async (payload: any) => {
      if (!payload?.action) return;
      if (payload.action.type === "save") {
        await onWidgetAction(payload.action as FactAction);
      }
    },
    [onWidgetAction]
  );

  const handleThemeChange = useCallback(
    (payload: any) => {
      if (payload?.scheme) {
        onThemeRequest(payload.scheme as ColorScheme);
      }
    },
    [onThemeRequest]
  );

  const handleMessagesEnd = useCallback(() => {
    onResponseEnd();
  }, [onResponseEnd]);

  const handleError = useCallback(
    (payload: any) => {
      if (payload.type === "script_error") {
        setError((prev) => ({ ...prev, script: payload.error }));
      } else if (payload.type === "session_error") {
        setError((prev) => ({ ...prev, session: payload.error }));
      } else if (payload.type === "integration_error") {
        setError((prev) => ({ ...prev, integration: payload.error }));
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
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}
