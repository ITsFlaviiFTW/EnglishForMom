#!/usr/bin/env bash
# Runs on the server as root (called by deploy.sh).
# Usage: remote-install.sh <staged-dir> <build-id>
#   <staged-dir>/site    the built web app (dist/)
#   <staged-dir>/deploy  these deploy files
set -euo pipefail

STAGE="$1"
BUILD_ID="$2"
APP=/srv/apps/prava
DOMAIN=english.flavstudios.dev
WEBROOT=/var/www/letsencrypt
CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
SITE=/etc/nginx/sites-available/prava
KEEP_RELEASES=5

if [[ ! "$BUILD_ID" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "Refusing odd build id: $BUILD_ID" >&2
    exit 1
fi
for required in index.html sw.js manifest.webmanifest "lessons/[lessonId].html"; do
    [ -f "$STAGE/site/$required" ] || { echo "Staged site is missing $required" >&2; exit 1; }
done

# Installs an Nginx site file, keeping the previous one if `nginx -t` fails,
# so a bad file can never block reloads for the other sites on this server.
install_site() {
    local source="$1" backup=""
    if [ -f "$SITE" ]; then
        backup="$(mktemp)"
        cp -a "$SITE" "$backup"
    fi
    install -m 644 "$source" "$SITE"
    ln -sf "$SITE" /etc/nginx/sites-enabled/prava
    if ! nginx -t; then
        echo "nginx -t failed; restoring the previous Prava site file." >&2
        if [ -n "$backup" ]; then
            cp -a "$backup" "$SITE"
        else
            rm -f "$SITE" /etc/nginx/sites-enabled/prava
        fi
        exit 1
    fi
    [ -n "$backup" ] && rm -f "$backup"
    systemctl reload nginx
}

# 1. Unpack this release next to the earlier ones.
install -d -m 755 "$APP" "$APP/releases" "$WEBROOT"
RELEASE="$APP/releases/$BUILD_ID"
rm -rf "$RELEASE"
cp -a "$STAGE/site" "$RELEASE"
chown -R root:root "$RELEASE"
find "$RELEASE" -type d -exec chmod 755 {} +
find "$RELEASE" -type f -exec chmod 644 {} +

# 2. First deploy only: get the HTTPS certificate.
if [ ! -f "$CERT" ]; then
    echo "No certificate for $DOMAIN yet; requesting one from Let's Encrypt."
    install_site "$STAGE/deploy/nginx-prava-bootstrap.conf"
    certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" \
        --non-interactive --keep-until-expiring \
        --deploy-hook "systemctl reload nginx"
fi

# 3. Point the live site at this release (atomic switch), then load the full config.
ln -sfn "$RELEASE" "$APP/current.next"
mv -Tf "$APP/current.next" "$APP/current"
install_site "$STAGE/deploy/nginx-prava.conf"

# 4. Keep the newest releases for rollback; never the live one.
LIVE="$(readlink -f "$APP/current")"
find "$APP/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -rn | tail -n +$((KEEP_RELEASES + 1)) | cut -d' ' -f2- \
    | while read -r old; do
        [ "$(readlink -f "$old")" = "$LIVE" ] || rm -rf "$old"
    done

rm -rf "$STAGE"

# `systemctl reload` returns before Nginx has switched over, so give it a few seconds.
served=""
for _ in 1 2 3 4 5 6 7 8 9 10; do
    served="$(curl -fsS --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/version.json" 2>/dev/null || true)"
    if echo "$served" | grep -q "\"$BUILD_ID\""; then
        echo "Deployed $BUILD_ID — https://$DOMAIN is serving it."
        exit 0
    fi
    sleep 1
done
echo "Live site does not report $BUILD_ID: ${served:-no answer}" >&2
exit 1
