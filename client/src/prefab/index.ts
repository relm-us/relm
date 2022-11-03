// Regular construction set
import { makeBall } from "./makeBall";
import { makeBox } from "./makeBox";
import { makeDiamond } from "./makeDiamond";
import { makeRock } from "./makeRock";
import { makeTv } from "./makeTv";
import { makeWebBox } from "./makeWebBox";
import { makeWhiteboard } from "./makeWhiteboard";

import { worldManager } from "~/world";

export const directory = [
  { name: "Ball", make: makeBall },
  { name: "Box", make: makeBox },
  { name: "Diamond", make: makeDiamond },
  { name: "Rock", make: makeRock },
  { name: "Sticky Note", make: makeStickyNote },
  { name: "Whiteboard", make: makeWhiteboard },
  { name: "Webview", make: makeWebBox },
  { name: "Television", make: makeTv },
];

function activate(entity) {
  entity.activate();
  worldManager.worldDoc.syncFrom(entity);
  for (const child of entity.getChildren()) {
    activate(child);
  }
}

export function createPrefab(name, props = {}) {
  const position = worldManager.participants.local.avatar.position;
  if (position) {
    const prefab = directory.find((item) => item.name === name);
    if (prefab) {
      let entities = prefab.make(worldManager.world, {
        x: position.x,
        y: position.y,
        z: position.z,
        ...props,
      } as any);
      if (!(entities instanceof Array)) entities = [entities];

      for (const entity of entities) activate(entity);
    } else {
      console.error(`Prefab not found: '${name}'`);
    }
  } else {
    console.error(`Can't create prefab, avatar not found`);
  }
}
