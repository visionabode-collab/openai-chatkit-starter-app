import { NextResponse } from "next/server";

export const runtime = "edge";

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";

export async function POST(request: Request): Promise<Response> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable" },
        { status: 500 }
      );
    }

    const workflowId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
    if (!workflowId) {
      return NextResponse.json(
        { error: "Missing workflow id" },
        { status: 400 }
      );
    }

    const apiBase = process.env.CHATKIT_API_BASE ?? DEFAULT_CHATKIT_BASE;
    const url = `${apiBase}/v1/chatkit/sessions`;
    
    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        chatkit_configuration: {
          file_upload: {
            enabled: false,
          },
        },
      }),
    });

    const upstreamJson = await upstreamResponse.json().catch(() => ({}));

    if (!upstreamResponse.ok) {
      console.error("OpenAI ChatKit session creation failed", {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        body: upstreamJson,
      });
      return NextResponse.json(
        {
          error: `Failed to create session: ${upstreamResponse.statusText}`,
          details: upstreamJson,
        },
        { status: upstreamResponse.status }
      );
    }

    return NextResponse.json(upstreamJson);
  } catch (error) {
    console.error("Unexpected error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
