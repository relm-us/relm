import { EntityId } from "~/ecs/base";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { yEntityToJSON } from "relm-common/yrelm";
import { YEntity } from "relm-common/yrelm/types";

const RELM_EXPORT_VERSION = "v1.3";

export type FormatOpts = {
  relm?: string;
  scope?: string;
  timestamp?: Date;
  entryways?: Record<string, any>;
  settings?: Record<string, any>;
};

export function jsonFormat(
  entities: Array<any>,
  {
    relm = "relm",
    scope = "all",
    entryways = {},
    settings = {},
    timestamp,
  }: FormatOpts
) {
  return {
    relm,
    version: RELM_EXPORT_VERSION,
    timestamp: (timestamp || new Date()).toISOString(),
    scope,
    entryways,
    settings,
    entities,
  };
}

function getAll(wdoc: WorldDoc) {
  return wdoc.entities.map((yentity) => {
    return yEntityToJSON(yentity as YEntity);
  });
}

function getSome(wdoc: WorldDoc, entityIds: Array<EntityId>) {
  return entityIds.map((entityId) => {
    const yentity = wdoc.hids.get(entityId);
    return yEntityToJSON(yentity);
  });
}

export function exportRelm(wdoc: WorldDoc, entityIds?: Array<EntityId>) {
  return entityIds ? getSome(wdoc, entityIds) : getAll(wdoc);
}

export function importRelm(wdoc: WorldDoc, json) {
  if (!json.version || json.version !== RELM_EXPORT_VERSION) {
    throw new Error(
      `Imported JSON requires "version": "${RELM_EXPORT_VERSION}"`
    );
  }

  const entityIds = [];
  for (let data of json.entities) {
    entityIds.push(data.id);
    try {
      wdoc.syncFromJSON(data);
    } catch (err) {
      console.warn(data?.id, err);
    }
  }

  for (let [key, value] of Object.entries(json.settings as object)) {
    wdoc.settings.y.set(key, value);
  }

  for (let [key, value] of Object.entries(json.entryways as object)) {
    wdoc.entryways.y.set(key, value);
  }

  return entityIds;
}
