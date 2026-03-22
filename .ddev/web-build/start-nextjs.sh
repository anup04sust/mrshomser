#!/bin/bash

set -euo pipefail

cd /var/www/html

# Replace any stale dev server before starting a fresh one.
pkill -f 'next dev' || true

setsid pnpm dev --hostname 0.0.0.0 > /tmp/nextjs.log 2>&1 < /dev/null &

echo "Starting Next.js dev server..."
sleep 8

if curl -fsS http://127.0.0.1:3000 >/dev/null; then
  echo "Next.js is running at ${DDEV_PRIMARY_URL:-https://mrshomser.ddev.site}"
else
  echo "Next.js failed to start. Recent log output:"
  tail -20 /tmp/nextjs.log || true
  exit 1
fi
