#!/usr/bin/env bash
# Puts the Azure Speech key on the server for the speaking check ("Acum spune
# tu"), so Nginx can forward recordings to Azure (see /api/pronunciation in
# nginx-prava.conf). The key is read from .env.local and sent over SSH on
# stdin: it is never printed, never in git, never in the app.
# Run again after changing the key in .env.local.
# Usage: deploy/install-speech-key.sh [ssh-host]   (default host alias: flav-vps)
set -euo pipefail

HOST="${1:-flav-vps}"
cd "$(dirname "$0")/.."

read_setting() {
    grep -E "^$1=" .env.local 2>/dev/null | tail -n 1 | cut -d= -f2- | tr -d "\r\"'" || true
}
KEY="$(read_setting AZURE_SPEECH_KEY)"
REGION="$(read_setting AZURE_SPEECH_REGION)"
if [[ ! "$KEY" =~ ^[A-Za-z0-9]{20,}$ ]]; then
    echo "AZURE_SPEECH_KEY is missing or unusual in .env.local" >&2
    exit 1
fi
if [[ ! "$REGION" =~ ^[a-z0-9]+$ ]]; then
    echo "AZURE_SPEECH_REGION is missing or unusual in .env.local" >&2
    exit 1
fi

DIR=/etc/nginx/prava-secrets
# printf is a shell builtin, so the key never shows up in a process list.
printf '%s\n' \
    "# Written by deploy/install-speech-key.sh: Azure Speech for Prava's speaking check." \
    "# Holds the Azure key. Root only; never copy it anywhere else." \
    "proxy_pass https://$REGION.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed;" \
    "proxy_set_header Ocp-Apim-Subscription-Key \"$KEY\";" |
    ssh "$HOST" "set -e
        sudo install -d -m 700 -o root -g root $DIR
        sudo tee $DIR/speech.conf.new >/dev/null
        sudo chmod 600 $DIR/speech.conf.new
        sudo mv $DIR/speech.conf.new $DIR/speech.conf
        if sudo nginx -t 2>/dev/null; then
            sudo systemctl reload nginx
        else
            echo 'nginx -t failed; removing the new key file.' >&2
            sudo rm -f $DIR/speech.conf
            exit 1
        fi"
echo "Speech key installed on $HOST."
