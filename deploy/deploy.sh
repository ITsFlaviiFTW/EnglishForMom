#!/usr/bin/env bash
# Builds Prava's web app and publishes it to english.flavstudios.dev.
# Usage: deploy/deploy.sh [ssh-host]        (default host alias: flav-vps)
# Rollback: deploy/rollback.sh [ssh-host]   (switches back to the previous release)
set -euo pipefail

HOST="${1:-flav-vps}"
cd "$(dirname "$0")/.."

npm run build:web
BUILD_ID="$(node -p "require('./dist/version.json').buildId")"
STAGE="/tmp/prava-release"

echo "Uploading $BUILD_ID to $HOST"
ssh "$HOST" "rm -rf $STAGE && mkdir -p $STAGE/site $STAGE/deploy"
tar -czf - -C dist . | ssh "$HOST" "tar -xzf - -C $STAGE/site"
tar -czf - -C deploy . | ssh "$HOST" "tar -xzf - -C $STAGE/deploy"
ssh "$HOST" "sudo bash $STAGE/deploy/remote-install.sh $STAGE '$BUILD_ID'"
