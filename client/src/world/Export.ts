import { exportWorldDoc, MinimalRelmJSON, importNonEntities } from "relm-common";

import { WorldDoc } from "~/y-integration/WorldDoc";

const RELM_EXPORT_VERSION = "v1.5";

export type FormatOpts = {
  relm?: string;
  scope?: string;
  timestamp?: Date;
  entryways?: Record<string, any>;
  documents?: Record<string, any>;
  settings?: Record<string, any>;
};

export function jsonFormat(
  json: MinimalRelmJSON,
  { relm = "relm", scope = "all", timestamp }: FormatOpts
) {
  return {
    relm,
    version: RELM_EXPORT_VERSION,
    timestamp: (timestamp || new Date()).toISOString(),
    scope,
    ...json,
  };
}

export function exportRelm(
  wdoc: WorldDoc,
  entityIds?: Array<string>
): MinimalRelmJSON {
  return exportWorldDoc(wdoc.ydoc, entityIds ? new Set(entityIds) : null);
}

export function importRelm(wdoc: WorldDoc, json) {
  if (!json.version || json.version !== RELM_EXPORT_VERSION) {
    throw new Error(
      `Imported JSON requires "version": "${RELM_EXPORT_VERSION}"`
    );
  }

  importNonEntities(json, wdoc.ydoc);

  const entityIds = [];
  for (let entityJSON of json.entities) {
    try {
      entityIds.push(entityJSON.id);
      wdoc.syncFromJSON(entityJSON);
    } catch (err) {
      console.warn(entityJSON?.id, err);
    }
  }

  return entityIds;
}
