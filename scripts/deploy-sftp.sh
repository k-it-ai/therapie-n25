#!/usr/bin/env bash
# Upload dist/ to the STRATO web space via SFTP (used by .github/workflows/deploy-strato.yml).
# Env: SFTP_HOST, SFTP_USER, LFTP_PASSWORD, SFTP_DIR (folder on the server, "/" = the SFTP user's home).
# Safety: only syncs into an empty folder or one this script filled before (marker file), so a wrong
# SFTP_DIR can never wipe other folders on the web space.
set -euo pipefail
: "${SFTP_HOST:?}" "${SFTP_USER:?}" "${LFTP_PASSWORD:?}"
DIR="${SFTP_DIR:-/}"
MARKER=".therapie-n25-deploy"
TARGET="${SFTP_URL:-sftp://$SFTP_HOST}"

run() {
  lftp --env-password -u "$SFTP_USER" "$TARGET" -e "set sftp:auto-confirm yes; set net:max-retries 2; set net:timeout 30; $1; bye"
}

# the folder must already exist (a typo must not create a new folder somewhere else)
if ! raw=$(run "cd \"$DIR\" || exit 1; cls -1a"); then
  echo "::error::Folder '$DIR' not found for this SFTP user – nothing uploaded. Check STRATO_SFTP_DIR."
  exit 1
fi
listing=$(sed 's#/$##' <<<"$raw" | grep -vxE '\.{1,2}' || true)
if [ -n "$listing" ] && ! grep -qxF "$MARKER" <<<"$listing"; then
  echo "::error::'$DIR' is not empty and was not filled by this deploy – nothing uploaded. Contents:"
  echo "$listing"
  exit 1
fi

touch "dist/$MARKER"
run "mirror --reverse --delete --parallel=4 --verbose=1 dist/ \"$DIR\""
echo "Uploaded to $DIR"
