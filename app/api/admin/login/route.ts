import { jsonError, readJson } from "@/lib/route-helpers";

type AdminLoginInput = {
  password?: string;
};

type LoginAttemptState = {
  count: number;
  windowStartedAt: number;
  blockedUntil: number | null;
};

// EDITABLE VALUES BASED ON DESIRED RESTRICTION
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const loginAttempts = new Map<string, LoginAttemptState>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function getActiveAttempt(clientKey: string, now: number) {
  const attempt = loginAttempts.get(clientKey);

  if (!attempt) {
    return null;
  }

  if (attempt.blockedUntil && attempt.blockedUntil <= now) {
    loginAttempts.delete(clientKey);
    return null;
  }

  if (!attempt.blockedUntil && now - attempt.windowStartedAt > WINDOW_MS) {
    loginAttempts.delete(clientKey);
    return null;
  }

  return attempt;
}

function recordFailedAttempt(clientKey: string, now: number) {
  const currentAttempt = getActiveAttempt(clientKey, now);

  if (!currentAttempt) {
    const nextAttempt: LoginAttemptState = {
      count: 1,
      windowStartedAt: now,
      blockedUntil: null,
    };

    loginAttempts.set(clientKey, nextAttempt);
    return nextAttempt;
  }

  const nextCount = currentAttempt.count + 1;
  const nextAttempt: LoginAttemptState = {
    count: nextCount,
    windowStartedAt: currentAttempt.windowStartedAt,
    blockedUntil:
      nextCount >= MAX_FAILED_ATTEMPTS ? now + BLOCK_DURATION_MS : null,
  };

  loginAttempts.set(clientKey, nextAttempt);
  return nextAttempt;
}

export async function POST(request: Request) {
  const input = await readJson<AdminLoginInput>(request);

  if (!input || typeof input.password !== "string") {
    return jsonError("Password is required.");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return jsonError("Admin password is not configured.", 500);
  }

  const clientKey = getClientKey(request);
  const now = Date.now();
  const currentAttempt = getActiveAttempt(clientKey, now);

  if (currentAttempt?.blockedUntil && currentAttempt.blockedUntil > now) {
    return jsonError("Too many login attempts. Please try again later.", 429);
  }

  if (input.password !== adminPassword) {
    const nextAttempt = recordFailedAttempt(clientKey, now);

    if (nextAttempt.blockedUntil) {
      return jsonError("Too many login attempts. Please try again later.", 429);
    }

    return jsonError("Incorrect password.", 401);
  }

  loginAttempts.delete(clientKey);
  return Response.json({ ok: true });
}
