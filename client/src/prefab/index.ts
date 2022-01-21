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

export const directory = [
  { name: "Ball", prefab: makeBall },
  { name: "Billboard", prefab: makeBillboard },
  { name: "Box", prefab: makeBox },
  { name: "Diamond", prefab: makeDiamond },
  { name: "Ground", prefab: makeGround },
  { name: "Image", prefab: makeImage },
  { name: "Label", prefab: makeLabel },
  { name: "Thing", prefab: makeThing },
  { name: "Wall", prefab: makeWall },
  { name: "Web Page", prefab: makeWebBox },
  { name: "YouTube TV", prefab: makeTv },
];
