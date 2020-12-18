#!/bin/bash  

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd "$DIR/../packages/relm-server"
yarn start
