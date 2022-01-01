import * as Y from "yjs";
import { yEntityToJSON } from "../yrelm";
import { YEntity } from "../yrelm/types";
import { MinimalRelmJSON } from "./types";

export default function (ydoc: Y.Doc, ids?: Set<string>): MinimalRelmJSON {
  const yentities = ydoc.getArray("entities") as Y.Array<YEntity>;
  const entities = [];
  for (let entity of yentities) {
    const id = entity.get("id") as string;
    if (!ids || ids?.has(id)) {
      entities.push(yEntityToJSON(entity));
    }
  }

  const yentryways = ydoc.getMap("entryways") as Y.Map<Array<number>>;
  const entryways = {};
  for (let [name, coords] of [...yentryways]) {
    entryways[name] = coords;
  }

  const ysettings = ydoc.getMap("settings") as Y.Map<Array<any>>;
  const settings = {};
  for (let [name, value] of [...ysettings]) {
    settings[name] = value;
  }

  return { entities, entryways, settings };
}
