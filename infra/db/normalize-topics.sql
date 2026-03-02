-- Normalize existing topic_primary values to canonical categories.
-- Run in Supabase SQL Editor once after deploying this change.
-- New articles will be classified correctly by the updated AI prompt.

CREATE OR REPLACE FUNCTION normalize_topic(t TEXT) RETURNS TEXT AS $$
BEGIN
  IF t IS NULL THEN RETURN NULL; END IF;
  CASE
    WHEN LOWER(t) SIMILAR TO '%(tech|software|hardware|cyber|internet|digital|mobile|cloud|data|ai|machine learning|robot|chip|semiconductor|computing|app|startup)%'
      THEN RETURN 'Technology';
    WHEN LOWER(t) SIMILAR TO '%(politic|election|government|congress|senate|parliament|democrat|republican|vote|campaign|legislation|diplomacy|geopolit|president|minister|white house)%'
      THEN RETURN 'Politics';
    WHEN LOWER(t) SIMILAR TO '%(sport|football|soccer|basketball|tennis|golf|baseball|hockey|cricket|rugby|olympic|nfl|nba|mlb|nhl|formula 1|f1|grand prix|athlete|championship|tournament|league|wicket|innings|icc|semi-final|semifinal)%'
      THEN RETURN 'Sports';
    WHEN LOWER(t) SIMILAR TO '%(business|econom|financ|market|stock|trade|invest|bank|startup|entrepreneur|corporate|gdp|inflation|employ|job|revenue|profit|merger|acquisition)%'
      THEN RETURN 'Business';
    WHEN LOWER(t) SIMILAR TO '%(health|medic|doctor|hospital|disease|drug|vaccine|cancer|pandemic|treatment|patient|pharma|wellness|mental health|nutrition|fitness|surgery)%'
      THEN RETURN 'Health';
    WHEN LOWER(t) SIMILAR TO '%(science|research|space|nasa|climate|environment|physic|chemi|biolog|astronom|discover|energy|experiment|lab|fossil|planet|ocean)%'
      THEN RETURN 'Science';
    WHEN LOWER(t) SIMILAR TO '%(entertain|movie|film|music|celebrit|award|actor|actress|singer|tv|television|stream|gaming|arts|culture|hollywood|netflix|disney|concert|album)%'
      THEN RETURN 'Entertainment';
    ELSE RETURN 'World';
  END CASE;
END;
$$ LANGUAGE plpgsql;

UPDATE clusters
SET topic_primary = normalize_topic(topic_primary)
WHERE topic_primary IS NOT NULL
  AND topic_primary NOT IN ('Business','Entertainment','Health','Politics','Science','Sports','Technology','World');

UPDATE articles
SET topic_primary = normalize_topic(topic_primary)
WHERE topic_primary IS NOT NULL
  AND topic_primary NOT IN ('Business','Entertainment','Health','Politics','Science','Sports','Technology','World');

DROP FUNCTION normalize_topic;
