import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const session = await openai.beta.chatkit.sessions.create({
      assistant_id: process.env.NEXT_PUBLIC_ASSISTANT_ID!,
    });

    return NextResponse.json({
      client_secret: session.client_secret,
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
