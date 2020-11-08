ssh-add $HOME/.ssh/id_ed25519
rm -rf publid/build/
yarn build &&\
	./deploy-sync-staging.sh