import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

export async function sendMagicLinkEmail(to: string, magicLink: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    // Local dev — no-op, log the link instead
    console.log(`[auth] Magic link for ${to}: ${magicLink}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Sign in to BS News",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Sign in to BS News</h2>
        <p style="color: #475569;">Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
        <a href="${magicLink}"
           style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Sign in
        </a>
        <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
