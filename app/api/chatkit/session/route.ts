import { NextRequest, NextResponse } from "next/server";

// Standard Node.js runtime (More stable for env vars)
// removed "export const runtime = 'edge'"

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 1. Get the user object from the frontend
    let user = { id: "guest_fallback", name: "Website Visitor" };
    try {
      const body = await req.json();
      if (body.user) user = body.user;
    } catch (e) {
      console.log("No body sent, using fallback user");
    }

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
        
        // ✅ THE FIX: Send ONLY the ID string. 
        // The error happened because we were sending the whole object 'user'.
        user: user.id || "guest_fallback", 
        
        chatkit_configuration: {
          file_upload: { enabled: false },
        },
      }),
    });

    const json = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      console.error("OpenAI API error:", json);
      return NextResponse.json(json, { status: upstreamResponse.status });
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
