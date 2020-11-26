// Regular construction set
import { makeBox } from "./makeBox";
import { makeBall } from "./makeBall";
import { makeEntity } from "./makeEntity";
import { makeGround } from "./makeGround";
import { makeInvisibleBox } from "./makeInvisibleBox";
import { makePileOfBoxes } from "./makePileOfBoxes";
import { makeThing } from "./makeThing";
import { makeTv } from "./makeTv";
import { makeYoutube } from "./makeYoutube";

export {
  makeBox,
  makeBall,
  makeEntity,
  makeGround,
  makeInvisibleBox,
  makePileOfBoxes,
  makeThing,
  makeTv,
  makeYoutube,
};

// Special construction set
export { makeAvatarAndActivate } from "./makeAvatarAndActivate";
export { makeStageAndActivate } from "./makeStageAndActivate";
export { makeDemo } from "./makeDemo";

export const directory = [
  { name: "Box", prefab: makeBox },
  { name: "Ball", prefab: makeBall },
  { name: "Pile of Boxes", prefab: makePileOfBoxes },
  { name: "YouTube TV", prefab: makeTv },
];
