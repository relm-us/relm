import type { Permission as PermissionString } from "../db/permission.js";

import * as express from "express";
import cors from "cors";
import mkConscript from "conscript";
import * as Y from "yjs";
import { nanoid } from "nanoid";

import {
  exportWorldDoc,
  importWorldDoc,
  findInYArray,
  YComponents,
  YEntities,
  YEntity,
  jsonToYComponents,
  jsonToYMeta,
  jsonToYChildren,
  yComponentToJSON,
  yComponentsToJSON,
  jsonToYEntity,
  yEntityToJSON,
  yIdToString,
  YValues,
  YComponent,
} from "relm-common";

import * as config from "../config.js";
import * as middleware from "../middleware.js";
import * as twilio from "../lib/twilio.js";
import { Permission, Relm, Doc, Variable } from "../db/index.js";
import { getSyncedYDoc } from "../getSyncedYDoc.js";

import {
  wrapAsync,
  respondWithSuccess,
  respondWithError,
  randomToken,
} from "../utils/index.js";
import { RelmData } from "db/relm.js";

const conscript = mkConscript();

export const relm = express.Router();

// Clone a subrelm from its base relm
relm.post(
  "/clone",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  // `clonePermit` will be one of `read`, `access`, `edit`, or NULL. If the
  // participant has the appropriate authorization for this relm, then they
  // will be allowed to clone it to create a subrelm.
  middleware.authorized((req) => req.relm.clonePermitRequired),
  wrapAsync(async (req, res) => {
    const subrelmName = req.body.subrelmName || randomToken();

    const seedRelm = req.relm;

    const newRelmName = seedRelm.relmName + "/" + subrelmName;

    const newRelm = await Relm.createRelm({
      relmName: newRelmName,
      seedRelmId: seedRelm.relmId,
      createdBy: req.authenticatedParticipantId,
    });

    // Clone the "seed relm" into this new relm
    await cloneRelmDoc(seedRelm.permanentDocId, newRelm.permanentDocId);

    let permits = [];

    if (seedRelm.clonePermitAssigned === "access") {
      permits = ["access", "invite"];
    } else if (seedRelm.clonePermitAssigned === "edit") {
      permits = ["access", "edit", "invite"];
    }

    await Permission.setPermits({
      participantId: req.authenticatedParticipantId,
      relmId: newRelm.relmId,
      permits,
    });

    return respondWithSuccess(res, {
      action: "cloned",
      relm: newRelm,
      permits,
    });
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

    if (
      req.body.publicPermits !== undefined &&
      !Array.isArray(req.body.publicPermits)
    ) {
      throw Error("publicPermits must be an array");
    }

    // Since only `admin` can create a relm, we trust whatever publicPermits they provide
    const publicPermissions = req.body.publicPermits as PermissionString[];

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
        publicPermissions,
        createdBy: req.authenticatedParticipantId,
      };

      const cpReq = req.body.clonePermitRequired;
      if (cpReq === "read" || cpReq === "access" || cpReq === "edit") {
        attrs.clonePermitRequired = cpReq;
      }

      const cpAsn = req.body.clonePermitAssigned;
      if (cpAsn === "access" || cpAsn === "edit") {
        // Strict limit to prevent privilege escalation
        attrs.clonePermitAssigned = cpAsn;
      }

      console.log('attrs', attrs)
      const relm = await Relm.createRelm(attrs);

      if (seedRelmId) {
        // Clone the "seed relm" into this new relm
        const seedRelmDocId = await Doc.getSeedDocId({
          docId: relm.permanentDocId,
        });
        await cloneRelmDoc(seedRelmDocId, relm.permanentDocId);

        if (seedRelmName) {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedRelmName}' ` +
              `('${seedRelmDocId}') (creator: '${req.authenticatedParticipantId}')`
          );
        } else {
          console.log(
            `Cloned new relm '${req.relmName}' from '${seedRelmDocId}' ` +
              `(creator: '${req.authenticatedParticipantId}')`
          );
        }
      } else {
        // Populate the new relm with basic ground
        const newRelmDoc: Y.Doc = await getSyncedYDoc(relm.permanentDocId);
        importWorldDoc(config.DEFAULT_RELM_CONTENT, newRelmDoc);

        console.log(
          `Created relm '${req.relmName}' ` +
            `(creator: '${req.authenticatedParticipantId}')`
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
  const seedRelmDoc: Y.Doc = await getSyncedYDoc(seedRelmDocId);
  const relmContent = exportWorldDoc(seedRelmDoc);

  const newRelmDoc: Y.Doc = await getSyncedYDoc(newRelmDocId);
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
    const relmDoc = await getSyncedYDoc(req.relm.permanentDocId);
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
    const doc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);
    req.relm.permanentDocSize = Y.encodeStateAsUpdate(doc).byteLength;
    const twilioToken = twilio.getToken(req.authenticatedParticipantId);

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

    if (Array.isArray(req.body.publicPermits)) {
      attrs.publicPermissions = req.body.publicPermits;
    }

    const cpReq = req.body.clonePermitRequired;
    if (cpReq === "read" || cpReq === "access" || cpReq === "edit") {
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
      req.authenticatedParticipantId
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
  middleware.authorized("read"),
  wrapAsync(async (req, res) => {
    const doc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);
    req.relm.permanentDocSize = Y.encodeStateAsUpdate(doc).byteLength;

    // TODO: don't reveal twilio token for `read`-level permission
    const twilioToken = twilio.getToken(req.authenticatedParticipantId);

    const permits = await getPermitsForRelm(
      req.relmName,
      req.authenticatedParticipantId
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

type EntityComponentData = {
  [component: string]: {
    [property: string]: any;
  };
};

type Action =
  | {
      type: "updateEntity";
      entity: string;
      components: EntityComponentData;
    }
  | {
      type: "createEntity";
      prefabId: string;
      components: EntityComponentData;
    }
  | {
      type: "deleteEntity";
      entity: string;
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

    const doc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);
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
    const doc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);

    const actions = req.body.actions;

    return respondWithSuccess(res, {
      result: applyActions(doc, actions),
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

type ActionResult =
  | ActionResultCreateEntity
  | ActionResultDeleteEntity
  | ActionResultSetProperties;

function applyActions(doc: Y.Doc, actions: Action[]) {
  const result: ActionResult[] = [];
  for (const data of actions || []) {
    switch (data.type) {
      case "createEntity":
        result.push(createEntity(doc, data.components));
        break;
      case "deleteEntity":
        result.push(deleteEntity(doc, data.entity));
        break;
      case "updateEntity": {
        result.push(setProperties(doc, data.entity, data.components));
        break;
      }
    }
  }
  return result;
}

type ActionResultCreateEntity =
  | {
      type: "createEntity";
      status: "success";
      entity: string;
    }
  | {
      type: "createEntity";
      status: "error";
      reason: string;
    };

function createEntity(
  doc: Y.Doc,
  components: EntityComponentData
): ActionResultCreateEntity {
  // Ensure components passed are valid
  if (typeof components !== "object") {
    return {
      type: "createEntity",
      status: "error",
      reason: "Invalid components provided.",
    };
  }

  const entities = doc.getArray("entities") as YEntities;

  const entity = {
    ...components,
    id: nanoid(),
    name: "",
    parent: null,
    children: [],
    meta: {},
  };
  const serializedEntity = jsonToYEntity(entity);

  entities.push([serializedEntity]);

  return {
    type: "createEntity",
    status: "success",
    entity: entity.id,
  };
}

type ActionResultDeleteEntity =
  | {
      type: "deleteEntity";
      status: "success";
    }
  | {
      type: "deleteEntity";
      status: "error";
      reason: string;
    };

function deleteEntity(doc: Y.Doc, entityId: string): ActionResultDeleteEntity {
  const entities = doc.getArray("entities") as YEntities;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities.get(i);
    const iteratedEntityId = entity.get("id");

    if (iteratedEntityId === entityId) {
      entities.delete(i);
      return {
        type: "deleteEntity",
        status: "success",
      };
    }
  }

  return {
    type: "deleteEntity",
    status: "error",
    reason: `No entity by the id ${entityId} could be found.`,
  };
}

type ActionResultSetProperties =
  | {
      type: "updateEntity";
      status: "success";
    }
  | {
      type: "updateEntity";
      status: "error";
      reason: string;
    };

function setProperties(
  doc: Y.Doc,
  entityId: string,
  componentsToSet: EntityComponentData
): ActionResultSetProperties {
  // Ensure components passed are valid
  if (typeof componentsToSet !== "object") {
    return {
      type: "updateEntity",
      status: "error",
      reason: "Invalid components provided.",
    };
  }

  const entities = doc.getArray("entities") as YEntities;
  const entity = findInYArray(
    entities,
    (yentity: YEntity) => yentity.get("id") === entityId
  );
  if (!entity) {
    return {
      type: "updateEntity",
      status: "error",
      reason: `entity not found ${entityId}`,
    };
  }

  if (!entity.has("components")) {
    entity.set("components", new Y.Map());
  }
  const entityComponents = entity.get("components") as YComponents;

  // Update the components provided in the request.
  doc.transact(() => {
    for (const componentName in componentsToSet) {
      // For each component to update, retrieve the index of the component in the components array.
      // If it does not exist, we will create the component ourselves later.
      let componentIndex = -1;
      let componentValues: YValues;
      for (let i = 0; i < entityComponents.length; i++) {
        if (entityComponents.get(i).get("name") === componentName) {
          componentIndex = i;
          componentValues = entityComponents.get(i).get("values") as YValues;
          break;
        }
      }

      // If the request wants us to delete the component, delete the component from the components array and move on.
      if (componentsToSet[componentName] === null) {
        if (componentIndex !== -1) {
          entityComponents.delete(componentIndex);
        }
        continue;
      }

      // If the component to be created does not currently exist, create it!
      if (componentIndex === -1) {
        // Create values map to be used for creating the actual component later.
        // Store all components to be set in this map.
        componentValues = new Y.Map();
      }

      // Apply any property changes requested.
      for (const propertyName in componentsToSet[componentName]) {
        const value = componentsToSet[componentName][propertyName];

        if (value !== null) {
          componentValues.set(propertyName, value);
        } else {
          // Request explicitly specified to delete the property. ({ [property: string]: null })
          componentValues.delete(propertyName);
        }
      }

      // All changes to the component are made!
      // Do we need to add this component to the entity components? (if it wasn't in the array already!)
      if (componentIndex === -1) {
        const component: YComponent = new Y.Map();
        component.set("name", componentName);
        component.set("values", componentValues);
        entityComponents.push([component]);
      }
    }
  });

  return {
    type: "updateEntity",
    status: "success",
  };
}

async function getPermitsForRelm(relmName: string, participantId: string) {
  const permissions = await Permission.getPermissions({
    participantId,
    relmNames: [relmName],
  });

  let permits = new Set(permissions[relmName] || []);
  if (permissions["*"]) {
    permissions["*"].forEach((permit) => permits.add(permit));
  }

  return [...permits];
}
