import { NextResponse } from "next/server";

export const runtime = "edge";

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";

export async function POST(): Promise<Response> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const workflowId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
    if (!workflowId) {
      return NextResponse.json(
        { error: "Missing workflow ID" },
        { status: 400 }
      );
    }

    const apiBase = process.env.CHATKIT_API_BASE ?? DEFAULT_CHATKIT_BASE;
    
    // ⚠️ FIX: Parentheses instead of backticks for fetch
    const upstreamResponse = await fetch(`${apiBase}/v1/chatkit/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        chatkit_configuration: {
          file_upload: { enabled: false },
        },
      }),
    });

    const json = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      console.error("OpenAI API error:", json);
      return NextResponse.json(
        { error: json.error?.message ?? "Failed to create session" },
        { status: upstreamResponse.status }
      );
    }

    // ✅ EXTRACT ONLY THE CLIENT SECRET
    const client_secret = json?.session?.client_secret;
    
    if (!client_secret) {
      console.error("Missing client_secret in response:", json);
      return NextResponse.json(
        { error: "Missing client_secret from upstream" },
        { status: 500 }
      );
    }

    // ✅ Return ONLY { client_secret }
    return NextResponse.json({ client_secret });
  } catch (err) {
    console.error("Session route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
