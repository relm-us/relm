import { EntityId } from "~/ecs/base";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { yEntityToJSON } from "relm-common/yrelm";
import { YEntity } from "relm-common/yrelm/types";

const RELM_EXPORT_VERSION = "relm-export v.1.2";

export type FormatOpts = {
  relm?: string;
  scope?: string;
  server?: string;
  timestamp?: Date;
};

export function jsonFormat(
  entities: Array<any>,
  { relm = "relm", timestamp, scope = "entire-relm", server }: FormatOpts
) {
  return {
    relm,
    version: RELM_EXPORT_VERSION,
    timestamp: (timestamp || new Date()).toISOString(),
    scope,
    server,
    count: entities.length,
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
  json.entities.forEach((data) => {
    entityIds.push(data.id);
    try {
      wdoc.syncFromJSON(data);
    } catch (err) {
      console.warn(err);
    }
  });

  return entityIds;
}
