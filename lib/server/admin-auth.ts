const ADMIN_SESSION_COOKIE = "gamecock-admin-session";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getAdminSessionToken() {
  const token = process.env.ADMIN_SESSION_TOKEN;

  if (!token) {
    throw new Error("ADMIN_SESSION_TOKEN is not configured.");
  }

  return token;
}

export function isValidAdminSession(sessionValue: string | undefined) {
  if (!sessionValue) {
    return false;
  }

  return sessionValue === getAdminSessionToken();
}

export function createAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  };
}

export function clearAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export { ADMIN_SESSION_COOKIE };
