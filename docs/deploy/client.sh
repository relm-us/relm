#!/usr/bin/ssh-agent bash

# Deployment environment; defaults to staging
ENV=${1:-staging}

echo "Deploying client to $ENV"
echo

# Use .env files in same directory as this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Load environment variables from .env.*.deploy file
# see: https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3625310#gistcomment-3625310
set -a
source <(
    cat "$SCRIPT_DIR/.env.$ENV.deploy" | \
    sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a

ssh-add $SSH_DEPLOY_ID

pushd client
pnpm build && \
rsync -azvP -e ssh dist/* "$SSH_DEPLOY_HOST:$HTMLDIR" && \
rsync -rv -e ssh --delete --existing --ignore-existing dist/ "$SSH_DEPLOY_HOST:$HTMLDIR"
popd
