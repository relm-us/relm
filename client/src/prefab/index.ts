// Regular construction set
import { makeBox } from "./makeBox";
import { makeBall } from "./makeBall";
import { makeEntity } from "./makeEntity";
import { makeGround } from "./makeGround";
import { makeInvisibleBox } from "./makeInvisibleBox";
import { makeLabel } from "./makeLabel";
import { makePileOfBoxes } from "./makePileOfBoxes";
import { makeThing } from "./makeThing";
import { makeImage } from "./makeImage";
import { makeTv } from "./makeTv";
import { makeWebPage } from "./makeWebPage";
import { makeWebBox } from "./makeWebBox";
import { makeYoutube } from "./makeYoutube";

export {
  makeBox,
  makeBall,
  makeEntity,
  makeGround,
  makeInvisibleBox,
  makeLabel,
  makePileOfBoxes,
  makeThing,
  makeImage,
  makeTv,
  makeWebPage,
  makeYoutube,
};

// Special construction set
export { makeAvatarAndActivate } from "./makeAvatarAndActivate";
export { makeStageAndActivate } from "./makeStageAndActivate";
export { makeDemo } from "./makeDemo";

export const directory = [
  { name: "Box", prefab: makeBox },
  { name: "Ball", prefab: makeBall },
  { name: "Image", prefab: makeImage },
  { name: "Label", prefab: makeLabel },
  { name: "Pile of Boxes", prefab: makePileOfBoxes },
  { name: "YouTube TV", prefab: makeTv },
  { name: "Web Page", prefab: makeWebBox },
];
