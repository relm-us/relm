#!/usr/bin/ssh-agent bash

# Deployment environment; defaults to staging
ENV=${1:-staging}

echo "Deploying server to $ENV"
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

# For any subsequent scp/ssh command, use the identify file specified by SSH_ID
ssh-add $SSH_USER_ID
if [ "$SSH_USER_ID" != "$SSH_ROOT_ID" ]; then
    ssh-add $SSH_ROOT_ID
fi

echo "Stopping relm server systemd unit..."
ssh "$SSH_ROOT_HOST" "systemctl stop relm-server-$ENV"

# Send .env file to server working directory
ssh "$SSH_USER_HOST" "mkdir -p '$WORKDIR'"
scp "$SCRIPT_DIR/.env.$ENV" "$SSH_USER_HOST:$WORKDIR/.env"

# Install pnpm
# ssh "$SSH_USER_HOST" "curl -fsSL https://get.pnpm.io/install.sh | PNPM_VERSION=7.0.0-rc.6 sh -"

# Send relm-common dependency
pushd common
VERSION_COMMON=$(node -p "require('./package.json').version")
COMMON_TGZ="relm-common-$VERSION_COMMON.tgz"
pnpm build && pnpm pack && \
scp "$COMMON_TGZ" "$SSH_USER_HOST:~/"
popd

# Install relm-server
pushd server
VERSION_SERVER=$(node -p "require('./package.json').version")
SERVER_TGZ="relm-server-$VERSION_SERVER.tgz"
pnpm build && pnpm pack && \
cat "$SERVER_TGZ" | \
  ssh "$SSH_USER_HOST" \
      "tar xzf - --strip-components=1 --directory='$WORKDIR'" && \
ssh "$SSH_USER_HOST" bash -t <<EOF
cd '$WORKDIR' && \
pnpm remove relm-common && \
pnpm add ~/relm-common-$VERSION_COMMON.tgz
EOF

echo "Starting relm server systemd unit..."
ssh "$SSH_ROOT_HOST" "systemctl start relm-server-$ENV"
popd

echo "Deployed"
