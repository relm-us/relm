# Relm

Relm is an open source 3D spatial platform for the web. You can use it to collaborate, video conference, meet, and create events online.

![Screenshot 1 - Quester](docs/scr1-quester.jpg)
![Screenshot 2 - Whiteboard](docs/scr2-whiteboard.jpg)
![Screenshot 3 - Pine Forest](docs/scr3-pineforest.jpg)
![Screenshot 4 - Floating Island](docs/scr4-float-island.jpg)

## Local Development

To run Relm locally, you will need the following prerequisites:

1. nodejs (v14+ is recommended)
2. postgresql (v13+ is recommended)

Create an empty database called `relm`:

```
createdb relm
```

Then, clone this repo, install the dependencies and run the server:

```bash
pnpm install
pnpm dev
```

This should start both the backend server (yjs, assets, permissions) and frontend server (hosting the client javascript files). Visit http://localhost:8080/admin?token=setup to initialize a blank world and authorize your admin token.

After your first-time use, the `?token=setup` is no longer required.

## Notes on Production Deployment

These are some rough notes on getting Relm running on your own hosted server:

- there's no need to run a javascript "frontend server" in production
- instead, an nginx server works well; see scripts/nginx/* for sample setup
- when running the backend server, make sure it has all of the env vars it needs; see `scripts/deploy-staging.sh` for an example.
- you can proxy the backend server through nginx as well (see scripts/nginx/snippets)
- you can serve files with brotli compression to get better load times
- currently, the relm.us domain name is hard-coded, but you can easily change it
- for website screenshots to work: if installing the server on linux, you may need to manually install puppeteer's Chromium prereqs:

```
apt install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

## License

Relm's source code is licensed under the [GNU AGPL 3.0 license](LICENSE). We encourage you to use Relm for any purpose, including commercial purposes, but with the understanding that changes to the source code need to be made available to the public for the benefit of everyone.
