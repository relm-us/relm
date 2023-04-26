#!/usr/bin/ssh-agent bash

ssh-add $HOME/.ssh/id_ed25519

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR

rsync -azvP -e ssh sites-available/* root@relm.us:/etc/nginx/sites-available/
rsync -azvP -e ssh snippets/* root@relm.us:/etc/nginx/snippets/

ssh root@relm.us 'chown root:root /etc/nginx/snippets/*.conf'
ssh root@relm.us 'chown root:root /etc/nginx/sites-available/*.conf'