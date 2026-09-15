import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "gassi_session";

const SCHOOL_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const STAFF_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SchoolSession = {
  role: "school";
  tenderId: string;
  token: string;
};

export type StaffSession = {
  role: "staff";
  userId: string;
  email: string;
};

export type Session = SchoolSession | StaffSession;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(
  session: Session
): Promise<{ jwt: string; maxAge: number }> {
  const maxAge =
    session.role === "staff" ? STAFF_SESSION_MAX_AGE : SCHOOL_SESSION_MAX_AGE;
  const jwt = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(getSecretKey());
  return { jwt, maxAge };
}

export async function verifySession(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      payload.role === "school" &&
      typeof payload.tenderId === "string" &&
      typeof payload.token === "string"
    ) {
      return { role: "school", tenderId: payload.tenderId, token: payload.token };
    }
    if (
      payload.role === "staff" &&
      typeof payload.userId === "string" &&
      typeof payload.email === "string"
    ) {
      return { role: "staff", userId: payload.userId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}
