import * as express from "express";
import cors from "cors";
import * as Y from "yjs";

import * as config from "../config";
import * as util from "../utils";
import * as middleware from "../middleware";
import * as twilio from "../lib/twilio";
import { Permission, Relm, Doc } from "../db";
import { getYDoc } from "../getYDoc";
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
        const seedRelmDoc: Y.Doc = await getYDoc(seedDocId);

        relmContent = exportRelm(seedRelmDoc);
      } else {
        relmContent = config.DEFAULT_RELM_CONTENT;
      }

      const newRelmDoc: Y.Doc = await getYDoc(newRelmDocId);
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
    const doc: Y.Doc = await getYDoc(req.relm.permanentDocId);
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
    const permanentDoc = await getYDoc(req.relm.permanentDocId);
    const objects = permanentDoc.getMap("objects");
    req.relm.permanentDoc = objects.toJSON();

    return util.respond(res, 200, {
      status: "success",
      action: "read",
      relm: req.relm,
    });
  })
);

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

relm.get(
  "/permitsAndMeta",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const doc: Y.Doc = await getYDoc(req.relm.permanentDocId);
    req.relm.permanentDocSize = Y.encodeStateAsUpdate(doc).byteLength;

    const twilioToken = twilio.getToken(req.authenticatedPlayerId);
    const permissions = await Permission.getPermissions({
      playerId: req.authenticatedPlayerId,
      relmNames: [req.relmName],
    });

    return util.respond(res, 200, {
      status: "success",
      action: "read",
      relm: req.relm,
      permits: permissions[req.relmName] || [],
      twilioToken,
      jwt: req.jwtRaw,
    });
  })
);
