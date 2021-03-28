#!/bin/bash

BASEDIR=/home/relmprod
DATADIR=$BASEDIR/data

cd $BASEDIR/relm/server

while getopts :uh option
do
	case "${option}"
		in
		u) git pull origin main; yarn;;
		h) echo "use -u to update code from git"; exit;;
	esac
done

mkdir -p $DATADIR/assets
mkdir -p $DATADIR/tmp
mkdir -p $DATADIR/yjs

while true
do
	PORT=1237 \
	ASSETS_DIR=$DATADIR/assets \
	YPERSISTENCE=$DATADIR/yjs \
	TMP_DIR=$DATADIR/tmp \
	DATABASE_NAME=relmprod \
	node src/server.js

	sleep 1
done
