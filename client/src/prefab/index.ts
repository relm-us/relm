// Regular construction set
import { makeBall } from "./makeBall";
import { makeBillboard } from "./makeBillboard";
import { makeBox } from "./makeBox";
import { makeDiamond } from "./makeDiamond";
import { makeGround } from "./makeGround";
import { makeImage } from "./makeImage";
import { makeLabel } from "./makeLabel";
import { makeThing } from "./makeThing";
import { makeTv } from "./makeTv";
import { makeWall } from "./makeWall";
import { makeWebBox } from "./makeWebBox";

import { worldManager } from "~/world";
import { makeCard } from "./makeCard";

export const directory = [
  { name: "Ball", make: makeBall },
  { name: "Billboard", make: makeBillboard },
  { name: "Box", make: makeBox },
  { name: "Card", make: makeCard },
  { name: "Diamond", make: makeDiamond },
  { name: "Ground", make: makeGround },
  { name: "Image", make: makeImage },
  { name: "Label", make: makeLabel },
  { name: "Thing", make: makeThing },
  { name: "Wall", make: makeWall },
  { name: "Web Page", make: makeWebBox },
  { name: "TV (youtube)", make: makeTv },
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
