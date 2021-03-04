# Relm Architecture

Relm combines the following technologies:
- three.js webgl renderer
- rapier3d physics engine
- yjs state synchronization
- postgresql database

There is a backend server (see `server/`) that runs on nodejs, and a front-end client (see `client/`) that runs in the browser.

## Backend Server

The backend server has a RESTful API (see `server/src/server_http.js`), as well as a websocket-based Yjs state sync capability (see `server/src/server_ws.js`). The yjs data is stored on disk via leveldb.

## Frontend Client

The frontend client is compatible with all modern desktop browsers (Chrome, Firefox, Edge). It has 3 major components:

- an ECS (Entity Component System) based on [hecs](https://github.com/gohyperr/hecs) (see `client/src/ecs`)
- a UI implemented in [svelte](https://svelte.dev/) (see `client/src/ui`)
- a state sync system based on [yjs](https://yjs.dev/) (see `client/src/y-integration`)

The entrypoint for the client is `client/src/main.ts` which mounts `client/src/App.svelte`. The "god component" is the WorldManager at `client/src/world/WorldManager.ts` which is responsible for sequencing things like loading screens, starting the ECS, and managing various UI state and their interactions with the ECS.


