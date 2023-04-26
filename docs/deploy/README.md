# Setting up a Relm Host

How to set up Relm's backend server and frontend client for production.

Initial assumptions:

1. There is a server called `relm-main` to which we will deploy both the Relm front (browser client) and back (nodejs server) ends.
2. This `deploy` repository is a sub-directory of the `relm` repository.
3. Installing to an Ubuntu 20.04 or 22.04 server.

## Install Packages:

```
apt install postgresql nginx certbot python3-certbot-nginx
```

## Create Users:

```
useradd -m -s /bin/bash deploy
useradd -m -s /bin/bash relm-prod
```

Install pnpm in `relm-prod`:

```
su - relm-prod
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Edit .bashrc and move the pnpm-installed lines at the end of the file to
# the top of the file (BEFORE the 'not running interactively' case/return).
# We need this so that our deploy scripts can call pnpm without being inter-
# active terminals.
vim ~/.bashrc

# Install nodejs version 18.*
source ~/.bashrc
pnpm env use --global 18

# Set up data directory for server
mkdir -p ~/data/assets
```

## Create Database:

```
# as root, become `postgres` user:
su - postgres

createdb relm-prod

psql
# postgres=# create user "relm-prod";
# postgres=# grant all privileges on database "relm-prod" to "relm-prod";
```

Note that for relm-server to connect to the db, we expect 'trust' method
in `/etc/postgresql/14/main/pg_hba.conf`:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# "local" is for Unix domain socket connections only
local   all             all                                     peer
local   relm-prod       relm-prod                               trust
```

## Setup HTTP Server

Copy nginx config files from this deploy repo to the server:

```
# run this from your dev laptop:
scp nginx/sites-available/relm.us.conf relm-main:/etc/nginx/sites-available/
scp nginx/snippets/* relm-main:/etc/nginx/snippets/
```

Create HTML deploy directory:

```
mkdir /var/www/app.relm.us
chown deploy:deploy /var/www/app.relm.us

# Restart nginx
systemctl restart nginx
```

Install TLS certificates:

```
certbot --nginx -d app.relm.us -d data.relm.us
```

## Setup Systemd Service

Copy unit file:

```
scp systemd/relm-server-prod.service relm-main:/etc/systemd/system/
```

Start the service:

```
systemctl enable relm-server-prod.service
```

## Deploy

Now we can deploy once or many times:

```
./server.sh prod
./client.sh prod
```
