import { NextRequest, NextResponse } from "next/server";
import { agent } from "../../../lib/llm-agent";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    const response = await agent(messages, session.user);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API /chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
