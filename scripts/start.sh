#!/bin/bash  

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

start_all() {
  $DIR/relm-client.sh &
  $DIR/relm-server.sh
}

start_all