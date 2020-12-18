#!/bin/bash  

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

start_all() {
  $DIR/relm-client.sh &
  $DIR/relm-server.sh
}

stop_all() {
    pkill -f "relm-client" 
    pkill -f "relm-server"
}

case "$1" in 
    start)   start_all ;;
    stop)    stop_all ;;
    restart) stop_all; start_all ;;
    *) echo "usage: $0 start|stop|restart" >&2
       exit 1
       ;;
esac
