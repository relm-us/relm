import * as express from "express";
import cors from "cors";
import * as Y from "yjs";
import * as yws from "y-websocket/bin/utils";

import * as config from "../config";
import * as util from "../utils";
import * as middleware from "../middleware";
import * as twilio from "../lib/twilio";
import { Permission, Relm, Doc } from "../db";
import exportRelm from "relm-common/serialize/export";
import importRelm from "relm-common/serialize/import";

const { wrapAsync, uuidv4 } = util;

export const relm = express.Router();

// Create a new relm
relm.post(
  "/create",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relm = await Relm.getRelm({ relmName: req.relmName });
    if (relm !== null) {
      throw Error(`relm '${req.relmName}' already exists`);
    } else {
      let seedRelmId: string = req.body.seedRelmId;
      let seedRelmName: string = req.body.seedRelmName;

      if (seedRelmId) {
        const seedRelm = await Relm.getRelm({ relmId: seedRelmId });
        if (!seedRelm) {
          throw Error(
            `relm can't be created because ` +
              `seedRelmId '${seedRelmId}' doesn't exist`
          );
        }
      } else if (seedRelmName) {
        const seedRelm = await Relm.getRelm({ relmName: seedRelmName });
        if (!seedRelm) {
          throw Error(
            `relm can't be created because ` +
              `seed relm named '${seedRelmName}' doesn't exist`
          );
        }
        seedRelmId = seedRelm.relmId;
      }

      const relm = await Relm.createRelm({
        relmName: req.relmName,
        seedRelmId,
        isPublic: !!req.body.isPublic,
        createdBy: req.authenticatedPlayerId,
      });

      let seedDocId: string;
      let newRelmDocId: string = relm.permanentDocId;

      let relmContent;
      if (seedRelmId) {
        seedDocId = await Doc.getSeedDocId({
          docId: newRelmDocId,
        });
        const seedRelmDoc: Y.Doc = await yws.getYDoc(seedDocId);

        relmContent = exportRelm(seedRelmDoc);
      } else {
        relmContent = config.DEFAULT_RELM_CONTENT;
      }

      const newRelmDoc: Y.Doc = await yws.getYDoc(newRelmDocId);
      importRelm(relmContent, newRelmDoc);

      if (seedDocId) {
        if (seedRelmName) {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedRelmName}' ` +
              `('${seedDocId}') (creator: '${req.authenticatedPlayerId}')`
          );
        } else {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedDocId}' ` +
              `(creator: '${req.authenticatedPlayerId}')`
          );
        }
      } else {
        console.log(
          `Created relm '${req.relmName}' ` +
            `(creator: '${req.authenticatedPlayerId}')`
        );
      }

      return util.respond(res, 200, {
        status: "success",
        action: "create",
        relm,
      });
    }
  })
);

relm.delete(
  "/delete",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    await Relm.deleteRelm({ relmId: req.relm.relmId });
    return util.respond(res, 200, {
      status: "success",
      action: "delete",
      relmId: req.relm.relmId,
    });
  })
);

// Get an existing relm
relm.get(
  "/meta",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const doc: Y.Doc = await yws.getYDoc(req.relm.permanentDocId);
    req.relm.permanentDocSize = Y.encodeStateAsUpdate(doc).byteLength;
    const twilioToken = twilio.getToken(req.authenticatedPlayerId);

    return util.respond(res, 200, {
      status: "success",
      action: "read",
      relm: req.relm,
      twilioToken,
    });
  })
);

// Get an existing relm
relm.get(
  "/data",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const permanentDoc = await yws.getYDoc(req.relm.permanentDocId);
    const objects = permanentDoc.getMap("objects");
    req.relm.permanentDoc = objects.toJSON();

    return util.respond(res, 200, {
      status: "success",
      action: "read",
      relm: req.relm,
    });
  })
);

// Get a Twilio access token within a relm
relm.get(
  "/twilio",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const token = twilio.getToken(req.authenticatedPlayerId);

    return util.respond(res, 200, {
      status: "success",
      action: "token",
      relm: req.relm,
      token,
    });
  })
);

relm.post(
  "/truncate",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relm = req.relm;

    const permanentDoc = await yws.getYDoc(req.relm.permanentDocId);

    const newDocName = uuidv4();
    truncateYDoc(permanentDoc, newDocName);

    await Doc.setDoc({
      docId: newDocName,
      docType: "permanent",
      relmId: relm.relmId,
    });

    return util.respond(res, 200, {
      status: "success",
      action: "truncate",
    });
  })
);

function relmCopyObjects(src, dest) {
  for (const [uuid, attrs] of Object.entries(src.toJSON())) {
    const objectYMap = new Y.Map();

    for (const [key, values] of Object.entries(attrs)) {
      if (key.indexOf("@") === 0) {
        objectYMap.set(key, values);
      } else {
        const attrYMap = new Y.Map();
        for (const [k, v] of Object.entries(values)) {
          attrYMap.set(k, v);
        }
        objectYMap.set(key, attrYMap);
      }
    }

    dest.set(uuid, objectYMap);
  }
}

function truncateYDoc(ydoc, newDocName) {
  const truncatedYDoc = yws.getYDoc(newDocName);

  const objects = ydoc.getMap("objects");

  const truncatedObjects = truncatedYDoc.getMap("objects");

  relmCopyObjects(objects, truncatedObjects);

  return truncatedYDoc;
}

// Update an existing relm
relm.put(
  "/meta",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    const attrs = {
      relmId: req.relm.relmId,
      isPublic: !!req.body.isPublic,
      createdBy: req.authenticatedPlayerId,
    };

    const relm = await Relm.updateRelm(attrs);
    return util.respond(res, 200, {
      status: "success",
      action: "update",
      relm,
    });
  })
);

relm.get(
  "/permits",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  wrapAsync(async (req, res) => {
    const permissions = await Permission.getPermissions({
      playerId: req.authenticatedPlayerId,
      relmNames: [req.relmName],
    });
    util.respond(res, 200, {
      status: "success",
      permits: permissions[req.relmName] || [],
      jwt: req.jwtRaw,
    });
  })
);
