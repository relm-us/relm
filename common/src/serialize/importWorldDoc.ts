import * as Y from "yjs";
import { deltaToYText, jsonToYEntity, YEntity } from "../yrelm/index.js";
import { MinimalRelmJSON } from "./types.js";

export function importWorldDoc(source: MinimalRelmJSON, dest: Y.Doc) {
  const yentities = dest.getArray("entities") as Y.Array<YEntity>;
  // Y.Array#push takes many items, unlike regular Array#push
  yentities.push(source.entities.map((e) => jsonToYEntity(e)));

  const yentryways = dest.getMap("entryways") as Y.Map<Array<number>>;
  for (let [name, coords] of Object.entries(source.entryways)) {
    yentryways.set(name, coords);
  }

  const ysettings = dest.getMap("settings") as Y.Map<Array<any>>;
  for (let [name, value] of Object.entries(source.settings)) {
    ysettings.set(name, value);
  }

  const ydocuments = dest.getMap("documents") as Y.Map<Y.Text>;
  for (let [name, value] of Object.entries(source.documents)) {
    ydocuments.set(name, deltaToYText(value));
  }
}
