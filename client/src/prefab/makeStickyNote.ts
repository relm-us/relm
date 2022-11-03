import { nanoid } from "nanoid";
import { Vector3, Vector2, Color } from "three";
import { Draggable } from "~/ecs/plugins/clickable";

import { Transform } from "~/ecs/plugins/core";
import { CssPlane, Document } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeStickyNote(
  world,
  { x = 0, y = 0, z = 0, w = 1.5, h = 1.5, color = "#f1ec78" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  return makeEntity(world, "Sticky Note")
    .add(Transform, {
      position: new Vector3(x, y + h / 2, z),
    })
    .add(Document, {
      docId: nanoid(10), // make a unique sticky note each time
      placeholder: "Note",
      editable: true,
      simpleMode: true,
      bgColor: color,
      emptyFormat: {
        size: "36px",
        font: "quicksand",
        color: "#000000",
        align: "center",
      },
    })
    .add(CssPlane, {
      kind: "ROUNDED",
      circleRadius: 0.05,
      rectangleSize: new Vector2(w - 0.2, h - 0.2),
      scale: 1.0,
    })
    .add(Draggable);
}
