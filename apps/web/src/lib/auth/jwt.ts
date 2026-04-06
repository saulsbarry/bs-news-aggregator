import { SignJWT, jwtVerify } from "jose";
import { cacheGet, cacheSet } from "../cache";

const ALG = "HS256";
const EXPIRY = "30d";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  jti: string;
}

export async function signSessionJwt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifySessionJwt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    const jti = payload.jti as string;
    // Check revocation list
    const revoked = await cacheGet<boolean>(`auth:revoked:${jti}`);
    if (revoked) return null;
    return {
      sub: payload.sub as string,
      email: payload["email"] as string,
      jti,
    };
  } catch {
    return null;
  }
}

export async function revokeSessionJwt(token: string): Promise<void> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    const jti = payload.jti as string;
    const exp = payload.exp as number;
    const ttl = Math.max(1, exp - Math.floor(Date.now() / 1000));
    await cacheSet(`auth:revoked:${jti}`, true, ttl);
  } catch {
    // invalid token — nothing to revoke
  }
}
