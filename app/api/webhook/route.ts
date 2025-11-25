import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const _body = await request.json();
    // Webhook received - process accordingly
    return NextResponse.json({ success: true });
  } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Webhook error:", error);
      }
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
