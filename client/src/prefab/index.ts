// Regular construction set
import { makeBall } from "./makeBall";
import { makeBillboard } from "./makeBillboard";
import { makeBox } from "./makeBox";
import { makeEntity } from "./makeEntity";
import { makeGround } from "./makeGround";
import { makeInitialCollider } from "./makeInitialCollider";
import { makeImage } from "./makeImage";
import { makeLabel } from "./makeLabel";
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
  makeThing,
  makeTv,
  makeWall,
  makeWebPage,
  makeYoutube,
};

export const directory = [
  { name: "Ball", prefab: makeBall },
  { name: "Billboard", prefab: makeBillboard },
  { name: "Box", prefab: makeBox },
  { name: "Ground", prefab: makeGround },
  { name: "Image", prefab: makeImage },
  { name: "Label", prefab: makeLabel },
  { name: "Thing", prefab: makeThing },
  { name: "Wall", prefab: makeWall },
  { name: "Web Page", prefab: makeWebBox },
  { name: "YouTube TV", prefab: makeTv },
];
