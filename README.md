# Relm v5.0

Relm is a community of artists, engineers, philosophers, and spiritual thinkers making a new kind of home on the internet.

Specifically, we're making a browser-based world that enables "virtual locality"--providing a way to be together with friends online in a community that meets more of our universal human needs than today's social networks do. Think of it as personal growth, spirituality-lite, and community, all being grown inside a browser so it's readily available and easy to use.

See https://www.relm.us for more info.

## Local Development

To run Relm 5.0 locally, you will need the following prerequisites:

1. nodejs (v14+ is recommended)
2. postgresql (v13+ is recommended)

Create an empty database called `relm`:

```
createdb relm
```

Then, clone this repo, install the dependencies and run the server:

```bash
yarn
yarn start
```

This should start both the backend server (yjs, assets, permissions) and frontend server (hosting the client javascript files). Visit http://localhost:8080?token=setup to try it out.

After your first-time use, the `?token=setup` is no longer required.

## Notes on Server Installation

These are some rough notes on getting Relm running on your own hosted server:

- there's no need to run a javascript "frontend server" in production
- instead, an nginx server works well; see scripts/nginx/* for sample setup
- when running the backend server, make sure it has all of the env vars it needs; see `scripts/deploy-staging.sh` for an example.
- you can proxy the backend server through nginx as well (see scripts/nginx/snippets)
- you can serve files with brotli compression to get better load times
- currently, the relm.us domain name is hard-coded, but you can easily change it

## Visit Us?

We're building a community around personal growth and spiritual-lite practices in an online space that gives us virtual locality. Interested? Check out https://www.relm.us and maybe join us on Discord.
