-- Fix broken RSS source URLs
-- Run in Supabase SQL Editor

-- Reuters (discontinued official RSS, use Google News proxy)
UPDATE sources SET url = 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US'
WHERE slug = 'reuters';

UPDATE sources SET url = 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+business&ceid=US:en&hl=en-US&gl=US'
WHERE slug = 'reuters-business';

UPDATE sources SET url = 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com+technology&ceid=US:en&hl=en-US&gl=US'
WHERE slug = 'reuters-tech';

-- AP News (official feed domain gone)
UPDATE sources SET url = 'https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&ceid=US:en&hl=en-US&gl=US'
WHERE slug = 'ap-news';

-- CNN (use HTTP, HTTPS cert is broken)
UPDATE sources SET url = 'http://rss.cnn.com/rss/edition.rss'
WHERE slug = 'cnn';

-- Politico (moved to rss subdomain)
UPDATE sources SET url = 'https://rss.politico.com/politics-news.xml'
WHERE slug = 'politico';

-- Harvard Business Review (moved domain, HTTP only)
UPDATE sources SET url = 'http://feeds.harvardbusiness.org/harvardbusiness'
WHERE slug = 'hbr';

-- Scientific American (HTTP only, HTTPS cert broken)
UPDATE sources SET url = 'http://rss.sciam.com/ScientificAmerican-Global'
WHERE slug = 'scientific-american';

-- Defense One (wrong path, needs /all/)
UPDATE sources SET url = 'https://www.defenseone.com/rss/all/'
WHERE slug = 'defense-one';

-- USA Today (malformed RSS, use Google News proxy)
UPDATE sources SET url = 'https://news.google.com/rss/search?q=when:24h+allinurl:usatoday.com&ceid=US:en&hl=en-US&gl=US'
WHERE slug = 'usa-today';

-- Disable paywalled sources with no public RSS
UPDATE sources SET is_active = FALSE
WHERE slug IN ('wsj', 'the-athletic', 'economist');
