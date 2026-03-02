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
