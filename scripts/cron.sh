#!/bin/bash
# BS News Aggregator - cron trigger script
# Add to crontab:
#   0,30 * * * * /path/to/scripts/cron.sh ingest
#   3,33 * * * * /path/to/scripts/cron.sh enrich
#   8,38 * * * * /path/to/scripts/cron.sh cluster
#   0,3 * * * * /path/to/scipts/cron.sh purge

APP_URL="https://bs-news-aggregator-web.vercel.app"
CRON_SECRET="${CRON_SECRET}"
JOB="${1}"

if [[ -z "$CRON_SECRET" ]]; then
  echo "ERROR: CRON_SECRET is not set"
  exit 1
fi

if [[ "$JOB" != "ingest" && "$JOB" != "enrich" && "$JOB" != "cluster" && "$JOB" != "purge" ]]; then
  echo "ERROR: Usage: $0 [ingest|enrich|cluster|purge]"
  exit 1
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${APP_URL}/api/cron/${JOB}" \
  -H "Authorization: Bearer ${CRON_SECRET}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [${JOB}] HTTP ${HTTP_CODE}: ${BODY}"

if [[ "$HTTP_CODE" != "200" ]]; then
  exit 1
fi
