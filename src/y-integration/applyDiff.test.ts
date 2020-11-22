import * as Y from "yjs";

import { DiffKind, Diff } from "./diffTypes";

import { yComponentsToJSON } from "./yToJson";

import {
  YEntities,
  YEntity,
  YMeta,
  YChildren,
  YComponents,
  YComponent,
  YValues,
  YValue,
} from "./types";

import { applyDiffToYEntity } from "./applyDiff";
import { jsonToYComponent, jsonToYComponents } from "./jsonToY";

describe("applyDiffToYEntity", () => {
  let ydoc: Y.Doc, yentity: YEntity;

  beforeEach(() => {
    ydoc = new Y.Doc();
    const yentities: YEntities = ydoc.getArray("entities");
    yentity = new Y.Map();
    yentities.push([yentity]);
  });

  test("update attributes", () => {
    const diff: Diff = {
      kind: "E",
      path: ["name"],
      lhs: "Box-1",
      rhs: "Not-Box-1",
    };
    expect(yentity.get("name")).toBeUndefined();
    applyDiffToYEntity(diff, yentity);
    expect(yentity.get("name")).toEqual("Not-Box-1");
  });

  test("add component", () => {
    const diff: Diff = {
      kind: "N",
      path: ["Transform"],
      rhs: { position: [1, 2, 3], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
    };
    expect(yentity.get("components")).toBeUndefined();
    applyDiffToYEntity(diff, yentity);
    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({
      Transform: {
        position: [1, 2, 3],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
    });
  });

  test("delete component", () => {
    const diff: Diff = {
      kind: "D",
      path: ["Transform"],
      lhs: {},
    };
    const ycomponents: YComponents = jsonToYComponents({ Transform: {} });
    yentity.set("components", ycomponents);

    expect((yentity.get("components") as YComponents).get(0)).toBeDefined();
    applyDiffToYEntity(diff, yentity);

    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({});
  });

  test("update component property value", () => {
    const diff: Diff = {
      kind: "E",
      path: ["Transform", "position", 2],
      lhs: 3,
      rhs: 4,
    };
    const ycomponents: YComponents = jsonToYComponents({
      Transform: { position: [1, 2, 3] },
    });
    yentity.set("components", ycomponents);

    expect((yentity.get("components") as YComponents).get(0)).toBeDefined();
    applyDiffToYEntity(diff, yentity);

    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({ Transform: { position: [1, 2, 4] } });
  });
});
