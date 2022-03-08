import * as express from "express";
import cors from "cors";
import * as Y from "yjs";

import exportRelm from "relm-common/serialize/export";
import importRelm from "relm-common/serialize/import";

import * as config from "../config";
import * as util from "../utils";
import * as middleware from "../middleware";
import * as twilio from "../lib/twilio";
import { respondWithSuccess, respondWithError } from "../utils";
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

      return respondWithSuccess(res, {
        action: "created",
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
    return respondWithSuccess(res, {
      action: "deleted",
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

    return respondWithSuccess(res, {
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

    return respondWithSuccess(res, {
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
    return respondWithSuccess(res, {
      action: "updated",
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
    respondWithSuccess(res, {
      action: "permitted",
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

    return respondWithSuccess(res, {
      action: "permitted",
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
  actions: Action[];
  timeout: number;
};

relm.get(
  "/variables",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    const relmId = req.relm.relmId;
    const variables = await Variable.getVariables({ relmId });

    return respondWithSuccess(res, {
      action: "getVariables",
      variables,
    });
  })
);

relm.post(
  "/variables",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const relmId = req.relm.relmId;

    const changes = req.body.changes;
    if (!changes) {
      return respondWithError(res, "changes required");
    }

    const doc: Y.Doc = await getYDoc(req.relm.permanentDocId);
    // console.log("doc.actions", doc.getMap("actions").toJSON());

    const variables = await Variable.getVariables({ relmId });
    // console.log("values", values);
    const results = {};

    for (let [operation, opValues] of Object.entries(changes)) {
      if (operation === "add") {
        /**
         * opValues will be in the form:
         * {
         *   "counter": 5,
         *   "secretCount": 1
         * }
         */
        for (let [name, value] of Object.entries(opValues)) {
          // Force conversion to number
          if (typeof variables[name] !== "number") {
            variables[name] = 0;
          }
          const newValue = variables[name] + value;
          setVariable(doc, variables, relmId, name, newValue);
          results[name] = newValue;
        }
      } else if (operation === "set") {
        /**
         * opValues will be in the form:
         * {
         *   "door": "closed",
         *   "secretCount": 1
         * }
         */
        for (let [name, value] of Object.entries(opValues)) {
          setVariable(doc, variables, relmId, name, value);
          results[name] = value;
        }
      } else if (operation === "map") {
        /**
         * opValues will be in the form:
         * {
         *   "door": {
         *     "open": "closed",
         *     "closed": "open",
         *     "*": "closed"      // catch-all state, including null
         *   }
         * }
         */
        for (let [name, mappings] of Object.entries(opValues)) {
          let currentValue = null;
          if (name in variables) {
            currentValue = variables[name];
          }

          let toValue = undefined;
          if (currentValue in (mappings as object)) {
            toValue = mappings[currentValue];
          } else if ("*" in (mappings as object)) {
            toValue = mappings["*"];
          }

          if (toValue !== undefined) {
            setVariable(doc, variables, relmId, name, toValue);
            results[name] = toValue;
          }
        }
      }
    }

    return respondWithSuccess(res, {
      action: "setVariables",
      variables: results,
    });
  })
);

async function setVariable(doc, variables, relmId, name, value) {
  console.log("setVariable", name, value, variables);
  await Variable.setVariable({ relmId, name, value });
  variables[name] = value;

  const actions = doc.getMap("actions");
  const possibilities = actions.get(name) as Possibility[];

  if (!possibilities) {
    // TODO: figure out why actions are sometimes not available by now??
    console.warn(
      `Unable to load possible actions for relm ${relmId};` +
        ` not setting variable ${name}`
    );
    return;
  }

  for (let possible of possibilities) {
    const test = conscript(possible.compare);
    if (test(variables)) {
      if (possible.timeout > 0) {
        setTimeout(() => applyActions(doc, possible.actions), possible.timeout);
      } else {
        applyActions(doc, possible.actions);
      }
    }
  }
}

function applyActions(doc: Y.Doc, actions: Action[]) {
  for (let { type, entity, component, property, value } of actions || []) {
    switch (type) {
      case "setProperty": {
        setProperty(doc, entity, component, property, value);
        break;
      }
    }
  }
}

function setProperty(
  doc: Y.Doc,
  entityId: string,
  componentName: string,
  propertyName: string,
  value: any
) {
  const entities = doc.getArray("entities") as YEntities;
  const entity = findInYArray(
    entities,
    (yentity: YEntity) => yentity.get("id") === entityId
  );
  if (entity) {
    const components = entity.get("components") as YComponents;
    if (components) {
      const component = findInYArray(
        components,
        (ycomponent) => ycomponent.get("name") === componentName
      );
      if (component) {
        const values = component.get("values") as YValues;
        values.set(propertyName, value);
      } else {
        console.log(
          "setProperty: component not found",
          entityId,
          componentName
        );
      }
    } else {
      console.log("setProperty: components not found", entityId);
    }
  } else {
    console.log("setProperty: entity not found", entityId);
  }
}
