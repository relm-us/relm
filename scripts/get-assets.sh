#!/usr/bin/ssh-agent bash

ssh-add $HOME/.ssh/id_ed25519

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../server

rsync -azvP -e ssh root@relm.us:/home/relmstaging/data/assets/* data/assets/
