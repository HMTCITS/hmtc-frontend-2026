#!/usr/bin/env bash
# Manual test of POST /api/cms/pages/:id/publish against local Directus.
# Local only: uses the seeded dev accounts and creates test pages.
# Needs: pnpm directus:setup, pnpm dev, curl, jq. Run with: pnpm smoke:publish
set -uo pipefail

BASE=${BASE:-http://localhost:3000}
API=$BASE/api/cms
PROKER=faf07ffb-76be-4a4f-b897-4e970dc99e00   # Bluecamp (seed data)
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT
PASS=0 FAIL=0

# call METHOD PATH [BODY] → sets STATUS and BODY
call() {
  local out
  out=$(curl -s -b "$JAR" -c "$JAR" -X "$1" "$API$2" \
    -H "Origin: $BASE" -H 'Content-Type: application/json' \
    ${3:+-d "$3"} -w $'\n%{http_code}')
  STATUS=${out##*$'\n'}
  BODY=${out%$'\n'*}
}

# check NAME EXPECTED_STATUS [EXPECTED_ERROR_CODE]
check() {
  local code
  code=$(jq -r '.error.code // empty' <<<"$BODY" 2>/dev/null)
  if [[ $STATUS == "$2" && ( -z ${3:-} || $code == "$3" ) ]]; then
    printf '  \e[32mPASS\e[0m %s → %s %s\n' "$1" "$STATUS" "$code"; ((PASS++))
  else
    printf '  \e[31mFAIL\e[0m %s → got %s %s, expected %s %s\n' "$1" "$STATUS" "$code" "$2" "${3:-}"
    echo "       $BODY" | head -c 400; echo; ((FAIL++))
  fi
}

login() {
  call POST /auth/logout >/dev/null
  call POST /auth/login "{\"email\":\"$1\",\"password\":\"$2\"}"
  [[ $STATUS == 200 ]] || { echo "login as $1 failed: $STATUS $BODY"; exit 1; }
  echo "  logged in as $1"
}

# new_page_in_review → sets PAGE and UPDATED (as the current user)
new_page_in_review() {
  local year
  for _ in $(seq 1 20); do
    year=$((2030 + RANDOM % 70))
    call POST /pages "{\"prokerId\":\"$PROKER\",\"editionYear\":$year,\"title\":\"Bluecamp $year\",\"pageType\":\"event\"}"
    [[ $STATUS == 200 || $STATUS == 201 ]] && break
    [[ $(jq -r '.error.code // empty' <<<"$BODY") == duplicate ]] || { echo "create failed: $STATUS $BODY"; exit 1; }
  done
  PAGE=$(jq -r .page.id <<<"$BODY")
  call POST "/pages/$PAGE/submit" "{\"expectedUpdatedAt\":\"$(jq -r .page.updatedAt <<<"$BODY")\"}"
  [[ $STATUS == 200 ]] || { echo "submit failed: $STATUS $BODY"; exit 1; }
  UPDATED=$(jq -r .page.updatedAt <<<"$BODY")
  echo "  page $PAGE (year $year) is in_review"
}

publish() { call POST "/pages/$PAGE/publish" "{\"expectedUpdatedAt\":\"$1\"${2:+,\"changeNote\":\"$2\"}}"; }

echo '== Setup: editor creates and submits a page'
login editor@example.com editor-local
new_page_in_review

echo '== Role checks'
publish "$UPDATED";                    check 'editor cannot publish' 403 forbidden
login reviewer@example.com reviewer-local
publish "$UPDATED";                    check 'reviewer cannot publish' 403 forbidden

echo '== Publisher'
login publisher@example.com publisher-local
publish 2020-01-01T00:00:00.000Z;      check 'stale expectedUpdatedAt' 409 stale_write
publish "$UPDATED" 'rilis pertama';    check 'publish' 200
if [[ $STATUS == 200 ]]; then
  jq -c '.page | {status, isLive, publishedRevisionId, latestEvent: .history[0].action}' <<<"$BODY" | sed 's/^/       /'
  [[ $(jq -r '.page.status + " " + (.page.isLive|tostring) + " " + .page.history[0].action' <<<"$BODY") == 'published true approved' ]] \
    && { printf '  \e[32mPASS\e[0m status=published, isLive=true, event=approved\n'; ((PASS++)); } \
    || { printf '  \e[31mFAIL\e[0m page detail after publish is wrong\n'; ((FAIL++)); }
fi
publish "$UPDATED" 'lagi';             check 'publish twice' 409 invalid_transition

echo '== Self-approval (admin submits, then tries to publish)'
login admin@example.com admin-local
new_page_in_review
publish "$UPDATED";                    check 'admin publishes own submission' 403 self_approval

echo
echo "Result: $PASS passed, $FAIL failed"
[[ $FAIL == 0 ]]
