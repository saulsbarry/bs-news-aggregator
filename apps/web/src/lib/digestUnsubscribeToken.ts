import { createHmac } from "crypto";

function getSecret(): string {
  return process.env.JWT_SECRET ?? "dev-secret";
}

export function createUnsubscribeToken(userId: string): string {
  return createHmac("sha256", getSecret()).update(userId).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = createUnsubscribeToken(userId);
  // Constant-time comparison via XOR
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
