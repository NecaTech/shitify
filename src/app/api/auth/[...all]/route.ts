import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { isLocalAuthEnabled } from "@/lib/auth/local";

async function betterAuthHandlers() {
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth);
}

function localAuthResponse() {
  return NextResponse.json(
    { error: "Better Auth API is disabled in local boilerplate auth mode." },
    { status: 404 },
  );
}

export async function GET(request: Request) {
  if (isLocalAuthEnabled()) return localAuthResponse();

  const handlers = await betterAuthHandlers();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (isLocalAuthEnabled()) return localAuthResponse();

  const handlers = await betterAuthHandlers();
  return handlers.POST(request);
}
