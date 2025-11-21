import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 1. Parse the incoming body from the frontend to get the 'user'
    // (This was missing in the old code!)
    const body = await req.json();
    const { user } = body;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const workflowId = process.env.OPENAI_ASSISTANT_ID || process.env.NEXT_PUBLIC_ASSISTANT_ID;
    if (!workflowId) {
      return NextResponse.json(
        { error: "Missing workflow ID (Assistant ID)" },
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
        // 2. Pass the user object through to OpenAI
        // (This fixes the 400 error)
        user: user || { 
            id: "guest_default", 
            name: "Website Visitor" 
        },
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

    return NextResponse.json(json);
  } catch (error) {
    console.error("Route handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
