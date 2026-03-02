export const CANONICAL_TOPICS = [
  "Business",
  "Entertainment",
  "Health",
  "Politics",
  "Science",
  "Sports",
  "Technology",
  "World",
] as const;

export type CanonicalTopic = (typeof CANONICAL_TOPICS)[number];

/**
 * Maps free-form AI topic keywords to a canonical category.
 * Used in the enrich job so topic_primary always holds a canonical value
 * while the topics JSONB column retains the original AI keywords.
 */
export function toCanonicalTopic(topics: string[]): CanonicalTopic {
  const text = topics.join(" ").toLowerCase();
  if (/tech|software|hardware|cyber|internet|digital|mobile|cloud|data|ai|machine learning|robot|chip|semiconductor|computing|app/.test(text))
    return "Technology";
  if (/politic|election|government|congress|senate|parliament|democrat|republican|vote|campaign|legislation|president|minister/.test(text))
    return "Politics";
  if (/sport|football|soccer|basketball|tennis|golf|baseball|hockey|cricket|rugby|olympic|nfl|nba|mlb|nhl|athlete|championship/.test(text))
    return "Sports";
  if (/business|econom|financ|market|stock|trade|invest|bank|startup|corporate|gdp|inflation|employ|revenue|profit/.test(text))
    return "Business";
  if (/health|medic|doctor|hospital|disease|drug|vaccine|cancer|pandemic|treatment|patient|pharma|wellness/.test(text))
    return "Health";
  if (/science|research|space|nasa|climate|environment|physic|chemi|biolog|astronom|discover|energy|experiment/.test(text))
    return "Science";
  if (/entertain|movie|film|music|celebrit|award|actor|actress|singer|tv|television|stream|gaming|arts|culture|hollywood/.test(text))
    return "Entertainment";
  return "World";
}
