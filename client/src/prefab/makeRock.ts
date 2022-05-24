import { Transform, Asset } from "~/ecs/plugins/core";

import { Vector3, Quaternion, Euler } from "three";

import { makeEntity } from "./makeEntity";
import { Model } from "~/ecs/plugins/model";
import { FaceMapColors } from "~/ecs/plugins/coloration";
import { pickOne } from "~/utils/pickOne";
import { Html2d } from "~/ecs/plugins/html2d";
import { Clickable, Draggable } from "~/ecs/plugins/clickable";

const rocks = [
  {
    url: "9db2233cc15613d599297055dbe6e6cb-6260.glb",
    height: 1.6,
  },
  { url: "08eb8b6d39a7d2c31ab60dc53d20937b-25376.glb", height: 4 },
  {
    url: "6106bde7596df050ab2f4a457ff19942-25412.glb",
    height: 0.76,
    za: (-90 / 180) * Math.PI,
  },
];

const colors = [
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#00ffff",
  "#ff00ff",
];

export function makeRock(
  world,
  { x, y, z, h = 1, xa = 0, ya = null, za = null, url = null }
) {
  if (url === null) {
    const rock = pickOne(rocks);
    console.log("rock", rock);
    url = rock.url;
    h = rock.height;
    if (rock.za && za === null) za = rock.za;
  }

  if (ya === null) ya = Math.random() * Math.PI * 2;
  if (za === null) za = 0;

  return makeEntity(world, "Rock")
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
      rotation: new Quaternion().setFromEuler(new Euler(xa, ya, za)),
    })
    .add(Model, {
      asset: new Asset(url),
    })
    .add(FaceMapColors, {
      colors: {
        color1: [
          pickOne(colors),
          (Math.random() - 0.5) * (Math.random() - 0.5),
        ],
      },
    })
    .add(Html2d, {
      kind: "INFO",
      vanchor: 2,
      editable: true,
      visible: false,
      zoomInvariant: false,
    })
    .add(Draggable)
    .add(Clickable, {
      kind: "TOGGLE",
    });
}
