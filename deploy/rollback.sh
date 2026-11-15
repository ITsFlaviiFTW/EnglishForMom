#!/usr/bin/env bash
# Switches english.flavstudios.dev back to the release before the live one.
# Usage: deploy/rollback.sh [ssh-host]      (default host alias: flav-vps)
set -euo pipefail

HOST="${1:-flav-vps}"

ssh "$HOST" 'sudo bash -s' <<'EOF'
set -euo pipefail
APP=/srv/apps/prava
LIVE="$(readlink -f "$APP/current")"
PREVIOUS="$(find "$APP/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -rn | cut -d' ' -f2- | grep -vxF "$LIVE" | head -n 1)"
if [ -z "$PREVIOUS" ]; then
    echo "No earlier release to roll back to." >&2
    exit 1
fi
ln -sfn "$PREVIOUS" "$APP/current.next"
mv -Tf "$APP/current.next" "$APP/current"
echo "Now serving $(basename "$PREVIOUS") (was $(basename "$LIVE"))."
EOF
