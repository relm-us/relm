import * as express from "express";
import cors from "cors";
import * as Y from "yjs";

import exportRelm from "relm-common/serialize/export";
import importRelm from "relm-common/serialize/import";

import * as config from "../config";
import * as util from "../utils";
import * as middleware from "../middleware";
import * as twilio from "../lib/twilio";
import { Permission, Relm, Doc, Variable } from "../db";
import { getYDoc } from "../getYDoc";
import mkConscript from "conscript";
import {
  findInYArray,
  YComponents,
  YEntities,
  YEntity,
  YValues,
} from "relm-common/yrelm";

const { wrapAsync, uuidv4 } = util;
const conscript = mkConscript();

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
  "/content",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const relmDoc = await getYDoc(req.relm.permanentDocId);
    const content = exportRelm(relmDoc);

    return util.respond(res, 200, {
      status: "success",
      action: "content",
      relm: { ...req.relm, content },
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
      action: "meta",
      relm: req.relm,
      twilioToken,
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

    let permits = new Set(permissions[req.relmName] || []);
    if (permissions["*"]) {
      permissions["*"].forEach((permit) => permits.add(permit));
    }

    return util.respond(res, 200, {
      status: "success",
      action: "read",
      relm: req.relm,
      permits: [...permits],
      twilioToken,
      jwt: req.jwtRaw,
    });
  })
);

type Action = {
  type: "setProperty";
  entity: string;
  component: string;
  property: string;
  value: any;
};

type Possibility = {
  compare: string;
  action: Action;
  timeout: number;
};

relm.post(
  "/variable",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const relmId = req.relm.relmId;

    const name = req.body.name;
    if (!name) return util.fail(res, "name required");

    const operation = req.body.operation;
    if (!operation) return util.fail(res, "operation required");

    if (operation === "set") {
      if (!("value" in req.body))
        return util.fail(res, "value required to set");

      await Variable.setVariable({
        relmId,
        name,
        value: req.body.value,
      });

      const values = await Variable.getVariables({ relmId });

      const doc: Y.Doc = await getYDoc(req.relm.permanentDocId);
      const possibilities = doc.getMap("actions")?.get(name) as Possibility[];
      for (let possible of possibilities) {
        const test = conscript(possible.compare);
        if (test(values)) applyAction(doc, possible.action);
      }

      return util.respond(res, 200, {
        status: "success",
        action: operation,
      });
    }
  })
);

function applyAction(doc: Y.Doc, action: Action) {
  switch (action.type) {
    case "setProperty": {
      const entities = doc.getArray("entities") as YEntities;
      const entity = findInYArray(
        entities,
        (yentity: YEntity) => yentity.get("id") === action.entity
      );
      if (entity) {
        const components = entity.get("components") as YComponents;
        if (components) {
          const component = findInYArray(
            components,
            (ycomponent) => ycomponent.get("name") === action.component
          );
          if (component) {
            const values = component.get("values") as YValues;
            values.set(action.property, action.value);
          }
        } else {
          console.log("entity not found", action.entity);
        }
      }
      break;
    }
  }
}
