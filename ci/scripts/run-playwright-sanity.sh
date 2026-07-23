#!/usr/bin/env bash
set -euo pipefail

cd source

python3 -m venv .ci-venv
source .ci-venv/bin/activate
pip install ./apps/api

export API_URL=http://127.0.0.1:8000

npm ci
npm run build

cd playwright
npm ci
cd ..

export STREAMFORGE_ENV=test
export STREAMFORGE_DB="$PWD/data/concourse.db"
export WEB_ORIGIN=http://127.0.0.1:3000

mkdir -p data

uvicorn app.main:app \
  --app-dir apps/api \
  --host 127.0.0.1 \
  --port 8000 \
  > ../artifacts/api.log 2>&1 &

npm --workspace apps/web run start -- \
  --hostname 127.0.0.1 \
  > ../artifacts/web.log 2>&1 &

for attempt in $(seq 1 60); do
  if curl --fail --silent http://127.0.0.1:8000/health/ready > /dev/null \
    && curl --fail --silent http://127.0.0.1:3000 > /dev/null; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    echo "StreamForge did not become ready within 60 seconds."
    exit 1
  fi

  sleep 1
done

set +e
cd playwright
BASE_URL=http://127.0.0.1:3000 \
CI=true \
npx playwright test tests/ui/sanity --project=chromium
test_status=$?
cd ..
set -e

cp -R playwright/playwright-report ../artifacts/ 2>/dev/null || true
cp -R playwright/test-results ../artifacts/ 2>/dev/null || true

exit "$test_status"
