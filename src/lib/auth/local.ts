import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { LOCAL_AUTH_COOKIE_NAME } from "./local-cookie";

const LOCAL_FOUNDER_USER_ID = "local_founder";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type LocalSessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "founder";
  exp: number;
};

type LocalSession = {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress: null;
    userAgent: null;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: null;
    role: "founder";
    createdAt: Date;
    updatedAt: Date;
  };
};

function base64url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(value)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

type LocalCredentials = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: "founder";
};

function localCredentials(): LocalCredentials[] {
  if (!env.LOCAL_AUTH_ENABLED || env.NODE_ENV === "production") {
    return [];
  }

  const credentials: LocalCredentials[] = [];

  if (env.FOUNDER_EMAIL && env.FOUNDER_NAME && env.FOUNDER_INITIAL_PASSWORD) {
    credentials.push({
      id: LOCAL_FOUNDER_USER_ID,
      email: env.FOUNDER_EMAIL.toLowerCase(),
      name: env.FOUNDER_NAME,
      password: env.FOUNDER_INITIAL_PASSWORD,
      role: "founder",
    });
  }

  return credentials;
}

export function isLocalAuthEnabled() {
  return localCredentials().length > 0;
}

export function canAttemptLocalAuth() {
  return Boolean(env.LOCAL_AUTH_ENABLED && env.NODE_ENV !== "production");
}

export async function createLocalAuthSession({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const credentials = localCredentials().find(
    (item) => item.email === email.trim().toLowerCase(),
  );
  if (!credentials) return false;

  if (password !== credentials.password) {
    return false;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload: LocalSessionPayload = {
    sub: credentials.id,
    email: credentials.email,
    name: credentials.name,
    role: credentials.role,
    exp: expiresAt,
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const token = `${encodedPayload}.${sign(encodedPayload)}`;
  const cookieStore = await cookies();

  cookieStore.set(LOCAL_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return true;
}

export async function clearLocalAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_AUTH_COOKIE_NAME);
}

export async function getLocalAuthSession(): Promise<LocalSession | null> {
  if (!canAttemptLocalAuth()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(LOCAL_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (
    !encodedPayload ||
    !signature ||
    !safeEqual(signature, sign(encodedPayload))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64url(encodedPayload),
    ) as Partial<LocalSessionPayload>;
    if (
      payload.sub !== LOCAL_FOUNDER_USER_ID ||
      payload.role !== "founder" ||
      !payload.email ||
      !payload.name ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(payload.exp * 1000);
    const user: LocalSession["user"] = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      emailVerified: true,
      image: null,
      role: payload.role,
      createdAt: now,
      updatedAt: now,
    };

    return {
      session: {
        id: "local_session",
        userId: payload.sub,
        token,
        expiresAt,
        ipAddress: null,
        userAgent: null,
        createdAt: now,
        updatedAt: now,
      },
      user,
    };
  } catch {
    return null;
  }
}
