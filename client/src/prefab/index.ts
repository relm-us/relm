// Regular construction set
import { makeBall } from "./makeBall";
import { makeBillboard } from "./makeBillboard";
import { makeBox } from "./makeBox";
import { makeEntity } from "./makeEntity";
import { makeGround } from "./makeGround";
import { makeInitialCollider } from "./makeInitialCollider";
import { makeImage } from "./makeImage";
import { makeLabel } from "./makeLabel";
import { makePileOfBoxes } from "./makePileOfBoxes";
import { makeThing } from "./makeThing";
import { makeTv } from "./makeTv";
import { makeWall } from "./makeWall";
import { makeWebPage } from "./makeWebPage";
import { makeWebBox } from "./makeWebBox";
import { makeYoutube } from "./makeYoutube";

export {
  makeBall,
  makeBillboard,
  makeBox,
  makeEntity,
  makeGround,
  makeInitialCollider,
  makeLabel,
  makeImage,
  makePileOfBoxes,
  makeThing,
  makeTv,
  makeWall,
  makeWebPage,
  makeYoutube,
};

// Special construction set
export { makeAvatarAndActivate } from "./makeAvatarAndActivate";
export { makeStageAndActivate } from "./makeStageAndActivate";

export const directory = [
  { name: "Ball", prefab: makeBall },
  { name: "Billboard", prefab: makeBillboard },
  { name: "Box", prefab: makeBox },
  { name: "Ground", prefab: makeGround },
  { name: "Image", prefab: makeImage },
  { name: "Label", prefab: makeLabel },
  { name: "Pile of Boxes", prefab: makePileOfBoxes },
  { name: "Thing", prefab: makeThing },
  { name: "Wall", prefab: makeWall },
  { name: "Web Page", prefab: makeWebBox },
  { name: "YouTube TV", prefab: makeTv },
];
