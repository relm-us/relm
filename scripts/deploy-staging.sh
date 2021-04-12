#!/usr/bin/ssh-agent bash

ssh-add $HOME/.ssh/id_ed25519

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../client

yarn build && \
rsync -azvP -e ssh public/* \
  deploy@relm.us:/var/www/staging.relm.us/ \
  --delete

cd $DIR/../server

yarn build && \
rsync -azvP -e ssh ./* \
  deploy@relm.us:~/relm-server/ \
  --exclude node_modules \
  --exclude data \
  --delete
