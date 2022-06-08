import * as express from "express";
import cors from "cors";
import mkConscript from "conscript";
import * as Y from "yjs";

import {
  exportWorldDoc,
  importWorldDoc,
  findInYArray,
  YComponents,
  YEntities,
  YEntity,
  YValues,
} from "relm-common";

import * as config from "../config.js";
import * as middleware from "../middleware.js";
import * as twilio from "../lib/twilio.js";
import { Permission, Relm, Doc, Variable } from "../db/index.js";
import { getYDoc } from "../getYDoc.js";

import {
  wrapAsync,
  respondWithSuccess,
  respondWithError,
  randomToken,
} from "../utils/index.js";

const conscript = mkConscript();

export const relm = express.Router();

// Clone a subrelm from its base relm
relm.post(
  "/clone",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  // `clonePermit` will be one of `access`, `edit`, or NULL;
  // If the participant has the appropriate authorization for
  // this relm, then they will be allowed to clone a subrelm
  middleware.authorized((req) => req.relm.clonePermitRequired),
  wrapAsync(async (req, res) => {
    const subrelmName = req.body.subrelmName || randomToken();

    const seedRelm = req.relm;

    const newRelmName = seedRelm.relmName + "/" + subrelmName;

    const newRelm = await Relm.createRelm({
      relmName: newRelmName,
      seedRelmId: seedRelm.relmId,
      isPublic: false,
      createdBy: req.authenticatedPlayerId,
    });

    // Clone the "seed relm" into this new relm
    await cloneRelmDoc(seedRelm.permanentDocId, newRelm.permanentDocId);

    let permits = [];

    if (seedRelm.clonePermitAssigned === "access") {
      permits = ["access", "invite"];
    } else if (seedRelm.clonePermitAssigned === "edit") {
      permits = ["access", "edit", "invite"];
    }

    const success = await Permission.setPermits({
      playerId: req.authenticatedPlayerId,
      relmId: newRelm.relmId,
      permits,
    });

    if (success) {
      return respondWithSuccess(res, {
        action: "cloned",
        relm: newRelm,
        permits,
      });
    } else {
      return respondWithError(res, { reason: "can't set permits" });
    }
  })
);

// Create a new relm
relm.post(
  "/create",
  cors(),
  middleware.authenticated(),
  middleware.authorized("admin"),
  wrapAsync(async (req, res) => {
    const relm = await Relm.getRelm({ relmName: req.relmName });

    let seedRelm;

    if (relm !== null) {
      throw Error(`relm '${req.relmName}' already exists`);
    } else {
      let seedRelmId: string = req.body.seedRelmId;
      let seedRelmName: string = req.body.seedRelmName;

      if (seedRelmId) {
        seedRelm = await Relm.getRelm({ relmId: seedRelmId });
        if (!seedRelm) {
          throw Error(
            `relm can't be created because ` +
              `seedRelmId '${seedRelmId}' doesn't exist`
          );
        }
      } else if (seedRelmName) {
        seedRelm = await Relm.getRelm({ relmName: seedRelmName });
        if (!seedRelm) {
          throw Error(
            `relm can't be created because ` +
              `seed relm named '${seedRelmName}' doesn't exist`
          );
        }
        seedRelmId = seedRelm.relmId;
      }

      const attrs: any = {
        relmName: req.relmName,
        seedRelmId,
        isPublic: !!req.body.isPublic,
        createdBy: req.authenticatedPlayerId,
      };

      const cpReq = req.body.clonePermitRequired;
      if (cpReq === "access" || cpReq === "edit") {
        attrs.clonePermitRequired = cpReq;
      }

      const cpAsn = req.body.clonePermitAssigned;
      if (cpAsn === "access" || cpAsn === "edit") {
        // Strict limit to prevent privilege escalation
        attrs.clonePermitAssigned = cpAsn;
      }

      const relm = await Relm.createRelm(attrs);

      // let seedDocId: string;
      // let newRelmDocId: string = relm.permanentDocId;

      // let relmContent;
      // if (seedRelmId) {
      //   seedDocId = await Doc.getSeedDocId({
      //     docId: newRelmDocId,
      //   });
      //   const seedRelmDoc: Y.Doc = await getYDoc(seedDocId);

      //   relmContent = exportWorldDoc(seedRelmDoc);
      // } else {
      //   relmContent = config.DEFAULT_RELM_CONTENT;
      // }

      // const newRelmDoc: Y.Doc = await getYDoc(newRelmDocId);
      // importWorldDoc(relmContent, newRelmDoc);

      if (seedRelmId) {
        // Clone the "seed relm" into this new relm
        const seedRelmDocId = await Doc.getSeedDocId({
          docId: relm.permanentDocId,
        });
        await cloneRelmDoc(seedRelmDocId, relm.permanentDocId);

        if (seedRelmName) {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedRelmName}' ` +
              `('${seedRelmDocId}') (creator: '${req.authenticatedPlayerId}')`
          );
        } else {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedRelmDocId}' ` +
              `(creator: '${req.authenticatedPlayerId}')`
          );
        }
      } else {
        // Populate the new relm with basic ground
        const newRelmDoc: Y.Doc = await getYDoc(relm.permanentDocId);
        importWorldDoc(config.DEFAULT_RELM_CONTENT, newRelmDoc);

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

async function cloneRelmDoc(seedRelmDocId: string, newRelmDocId: string) {
  const seedRelmDoc: Y.Doc = await getYDoc(seedRelmDocId);
  const relmContent = exportWorldDoc(seedRelmDoc);
  // console.log("relmContent", relmContent);

  const newRelmDoc: Y.Doc = await getYDoc(newRelmDocId);
  importWorldDoc(relmContent, newRelmDoc);

  return newRelmDoc;
}

relm.post(
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
relm.post(
  "/content",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("access"),
  wrapAsync(async (req, res) => {
    const relmDoc = await getYDoc(req.relm.permanentDocId);
    const content = exportWorldDoc(relmDoc);

    return respondWithSuccess(res, {
      action: "content",
      relm: { ...req.relm, content },
    });
  })
);

// Get an existing relm
relm.post(
  "/getmeta",
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
relm.post(
  "/setmeta",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    const attrs: any = {
      relmId: req.relm.relmId,
    };

    if (req.body.relmName) {
      attrs.relmName = req.body.relmName;
    }

    if (req.body.isPublic !== undefined) {
      attrs.isPublic = !!req.body.isPublic;
    }

    const cpReq = req.body.clonePermitRequired;
    if (cpReq === "access" || cpReq === "edit") {
      attrs.clonePermitRequired = cpReq;
    }

    const cpAsn = req.body.clonePermitAssigned;
    if (cpAsn === "access" || cpAsn === "edit") {
      // Strict limit to prevent privilege escalation
      attrs.clonePermitAssigned = cpAsn;
    }

    const relm = await Relm.updateRelm(attrs);
    if (relm) {
      return respondWithSuccess(res, {
        action: "updated",
        relm,
      });
    } else {
      return respondWithError(res, { reason: "invalid metadata" });
    }
  })
);

relm.post(
  "/permits",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  wrapAsync(async (req, res) => {
    const permits = await getPermitsForRelm(
      req.relmName,
      req.authenticatedPlayerId
    );

    respondWithSuccess(res, {
      action: "permitted",
      permits,
      jwt: req.jwtRaw,
    });
  })
);

relm.post(
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

    const permits = await getPermitsForRelm(
      req.relmName,
      req.authenticatedPlayerId
    );

    return respondWithSuccess(res, {
      action: "permitted",
      relm: req.relm,
      permits,
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

relm.post(
  "/getvars",
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
  "/setvars",
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

relm.post(
  "/edit",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  middleware.acceptJwt(),
  middleware.authorized("edit"),
  wrapAsync(async (req, res) => {
    const doc: Y.Doc = await getYDoc(req.relm.permanentDocId);

    const actions = req.body.actions;

    const errors = applyActions(doc, actions);

    if (errors.length === 0) {
      return respondWithSuccess(res, { action: "edit" });
    } else {
      return respondWithError(res, "applyActions had errors", errors);
    }
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
  const errors = [];
  for (let { type, entity, component, property, value } of actions || []) {
    switch (type) {
      case "setProperty": {
        errors.push(...setProperty(doc, entity, component, property, value));
        break;
      }
    }
  }
  return errors;
}

function setProperty(
  doc: Y.Doc,
  entityId: string,
  componentName: string,
  propertyName: string,
  value: any
) {
  const errors = [];

  const errorNotify = (msg) => {
    console.log(msg);
    errors.push(msg);
  };

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
        errorNotify(
          `setProperty: component not found ${entityId}, '${componentName}'`
        );
      }
    } else {
      errorNotify(`setProperty: components not found ${entityId}`);
    }
  } else {
    errorNotify(`setProperty: entity not found ${entityId}`);
  }
  return errors;
}

async function getPermitsForRelm(relmName: string, playerId: string) {
  const permissions = await Permission.getPermissions({
    playerId,
    relmNames: [relmName],
  });

  let permits = new Set(permissions[relmName] || []);
  if (permissions["*"]) {
    permissions["*"].forEach((permit) => permits.add(permit));
  }

  return [...permits];
}
