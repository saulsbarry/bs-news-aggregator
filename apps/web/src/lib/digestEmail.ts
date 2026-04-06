import { Resend } from "resend";
import type { RankedCluster } from "./feed";
import { createUnsubscribeToken } from "./digestUnsubscribeToken";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bs-news-aggregator-web.vercel.app";

export function buildDigestHtml(
  email: string,
  userId: string,
  clusters: RankedCluster[],
  frequency: "daily" | "weekly"
): string {
  const token = createUnsubscribeToken(userId);
  const unsubscribeUrl = `${BASE_URL}/api/digest/unsubscribe?userId=${userId}&token=${token}`;
  const label = frequency === "daily" ? "Daily" : "Weekly";

  const stories = clusters
    .slice(0, 10)
    .map(
      (c) => `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
        <a href="${BASE_URL}/story/${c.id}" style="font-size: 16px; font-weight: 600; color: #1e293b; text-decoration: none;">
          ${c.mainTitle ?? "Untitled story"}
        </a>
        ${c.summary ? `<p style="margin: 6px 0 0; color: #475569; font-size: 14px;">${c.summary}</p>` : ""}
        <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">
          ${c.articleCount} articles · ${c.primaryTopic ?? "General"} · ${c.sourceNames.slice(0, 3).join(", ")}
        </p>
      </div>
    `
    )
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #2563eb;">${label} digest from BS News</h2>
      <p style="color: #475569; font-size: 14px;">Your top ${clusters.length > 10 ? 10 : clusters.length} stories:</p>
      ${stories}
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        <a href="${unsubscribeUrl}" style="color: #94a3b8;">Unsubscribe</a> from ${frequency} digests.
      </p>
    </div>
  `;
}

export async function sendDigestEmail(
  to: string,
  html: string,
  subject: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[digest] Would send to ${to}: ${subject}`);
    return;
  }

  await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}
