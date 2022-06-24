# Relm Architecture

Relm combines the following technologies:
- three.js webgl renderer
- rapier3d physics engine (rust/WASM)
- yjs state synchronization
- postgresql database

There is a back-end server (see `server/`) that runs on nodejs, and a front-end client (see `client/`) that runs in the browser. Code that is common to both the back-end and the front-end is in the `common/` package.

## Backend Server

The backend server has a RESTful API (see `server/src/server_http.js`), as well as a websocket-based Yjs state sync capability (see `server/src/server_ws.js`). The yjs data is stored on disk via leveldb.

## Frontend Client

The frontend client is compatible with all modern desktop browsers (Chrome, Firefox, Safari, Edge). It has 3 major components:

- an ECS (Entity Component System) based on [hecs](https://github.com/gohyperr/hecs) (see `client/src/ecs`)
- a UI implemented in [svelte](https://svelte.dev/) (see `client/src/ui`)
- a state sync system based on [yjs](https://yjs.dev/) (see `client/src/y-integration`)

The entrypoint for the client is `client/src/main/index.ts` which mounts various views, depending on state, at `client/src/main/views/`.

High-level state of the system is managed by an "Elm Architecture" Program that dispatches messages (commands) that operate on the state and produce effects. See https://github.com/andrejewski/raj for a good explanation of how this is implemented in Javascript.

The "god component" is the WorldManager at `client/src/world/WorldManager.ts` which is responsible for containing all state during the running simulation--the ECS world, the yjs worldDoc, and various aspects of keyboard and pointer control.


