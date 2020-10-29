rsync -azvP -e ssh public/* deploy@relm.us:/var/www/html/relm-staging/ --delete
