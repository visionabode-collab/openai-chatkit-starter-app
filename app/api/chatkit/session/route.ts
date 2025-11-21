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

    // 🔥🔥 FINAL FIX — ChatKit requires EXACTLY this:
    const secret =
      json?.session?.client_secret?.value ??
      json?.client_secret ??
      json?.clientSecret ??
      null;

    if (!secret || typeof secret !== "string") {
      console.error("SECRET DEBUG RECEIVED:", json);
      return NextResponse.json(
        { error: "Upstream missing valid client_secret" },
        { status: 500 }
      );
    }

    // 🔥 Return EXACTLY what ChatKit expects
    return NextResponse.json({
      client_secret: secret,
    });
  } catch (err) {
    console.error("Session route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
