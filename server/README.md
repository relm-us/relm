# Relm Server

The Relm Server is a state sync server (via [yjs](https://github.com/yjs/yjs)) as well as a RESTful API for authentication, authorization, & subrelm administration.

## REST API

See ./docs/postman_collection.json for a complete list of API endpoints. This file can be imported by [Postman](https://www.postman.com/) and used as a way to test and/or administer Relm.

## Setup

Environment variables:

```
PORT: the port to listen on; default is 3000
TMP_DIR: a directory to temporarily place assets (images, GLBs) when uploaded
ASSETS_DIR: a directory to permanently store asset files
SCREENSHOTS_DIR: a directory to permanently store screenshots of websites
YPERSISTENCE: a directory to permanently store leveldb files containing synced subrelm data

DATABASE_URL: an (optional) postgres connection string, e.g. postgresql://user:secret@localhost:5433/relm
DATABASE_NAME: the name of the postgres database; default is 'relm'
DATABASE_HOST: the host of the postgres database; default is 'localhost'
DATABASE_PASSWORD: the (optional) password to the postgres database. Leave blank if you are using peer auth.

JWTSECRET: the (optional) JWT secret for integration with single-sign on systems
```

## Tests

```
yarn test
```

TODO: https://dev.to/nedsoft/testing-nodejs-express-api-with-jest-and-supertest-1km6