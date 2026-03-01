/**
 * AI client for summarization and embeddings.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise no-ops for cost-effective local dev.
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
const SUMMARIZE_MODEL = "gpt-4o-mini";

export interface SummarizeResult {
  summary: string;
  topics: string[];
}

export async function summarize(text: string): Promise<SummarizeResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const openai = (await import("openai")).default;
  const client = new openai({ apiKey });

  const truncated = text.slice(0, 12000);

  try {
    const completion = await client.chat.completions.create({
      model: SUMMARIZE_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Summarize the following news article in 2-4 concise sentences. Then list 1-5 topic keywords on a single line, comma-separated. Reply with exactly two lines: line 1 = summary, line 2 = topics."
        },
        { role: "user", content: truncated }
      ],
      max_tokens: 300
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    const [summaryLine, topicsLine] = content.split("\n").map((s) => s.trim());
    const summary = summaryLine ?? content;
    const topics = topicsLine
      ? topicsLine.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    return { summary, topics };
  } catch {
    return null;
  }
}

export async function embed(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const openai = (await import("openai")).default;
  const client = new openai({ apiKey });

  const truncated = text.slice(0, 8000);

  try {
    const res = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncated
    });
    const vec = res.data[0]?.embedding;
    return Array.isArray(vec) ? vec : null;
  } catch {
    return null;
  }
}
