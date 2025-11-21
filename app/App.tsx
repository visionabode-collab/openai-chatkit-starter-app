"use client";

import { useState } from "react";
import ChatKitPanel from "@/components/ChatKitPanel";

export default function App() {
  // Basic widget controls
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  return (
    <main className="flex min-h-screen flex-col items-center justify-end bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl">

        <ChatKitPanel
          apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}
          assistantId={process.env.NEXT_PUBLIC_ASSISTANT_ID ?? ""}
          threadId={threadId}
          onThreadIdChange={setThreadId}
          onClose={() => console.log("Widget closed")}
          isAudioEnabled={isAudioEnabled}
          onAudioToggle={() => setIsAudioEnabled(v => !v)}
        />

      </div>
    </main>
  );
}
