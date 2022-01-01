import * as Y from "yjs";

import { Change } from "./diffTypes";

import { YEntities, YEntity, YComponents } from "relm-common/yrelm/types";
import { jsonToYComponents, yComponentsToJSON } from "relm-common/yrelm";

import { applyChangeToYEntity } from "./applyDiff";

describe("applyChangeToYEntity", () => {
  let ydoc: Y.Doc, yentity: YEntity;

  beforeEach(() => {
    ydoc = new Y.Doc();
    const yentities: YEntities = ydoc.getArray("entities");
    yentity = new Y.Map();
    yentities.push([yentity]);
  });

  test("update name attribute", () => {
    const change: Change = {
      kind: "E",
      path: ["name"],
      lhs: "Box-1",
      rhs: "Not-Box-1",
    };
    expect(yentity.get("name")).toBeUndefined();
    applyChangeToYEntity(change, yentity);
    expect(yentity.get("name")).toEqual("Not-Box-1");
  });

  // test("update children attribute", () => {
  //   const change: Change = {
  //     kind: "E",
  //     path: ["name"],
  //     lhs: "Box-1",
  //     rhs: "Not-Box-1",
  //   };
  //   expect(yentity.get("name")).toBeUndefined();
  //   applyChangeToYEntity(change, yentity);
  //   expect(yentity.get("name")).toEqual("Not-Box-1");
  // });

  test("add component", () => {
    const change: Change = {
      kind: "N",
      path: ["Transform"],
      rhs: { position: [1, 2, 3], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
    };
    expect(yentity.get("components")).toBeUndefined();
    applyChangeToYEntity(change, yentity);
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
    const change: Change = {
      kind: "D",
      path: ["Transform"],
      lhs: {},
    };
    const ycomponents: YComponents = jsonToYComponents({ Transform: {} });
    yentity.set("components", ycomponents);

    expect((yentity.get("components") as YComponents).get(0)).toBeDefined();
    applyChangeToYEntity(change, yentity);

    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({});
  });

  test("update primitive component property value", () => {
    const change: Change = {
      kind: "E",
      lhs: 0.5,
      path: ["Shape", "sphereRadius"],
      rhs: 10,
    };
    const ycomponents: YComponents = jsonToYComponents({
      Shape: { sphereRadius: 0.5 },
    });
    yentity.set("components", ycomponents);

    expect((yentity.get("components") as YComponents).get(0)).toBeDefined();
    applyChangeToYEntity(change, yentity);

    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({ Shape: { sphereRadius: 10 } });
  });

  test("update compound component property value", () => {
    const change: Change = {
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
    applyChangeToYEntity(change, yentity);

    const data = yComponentsToJSON(yentity.get("components") as YComponents);
    expect(data).toEqual({ Transform: { position: [1, 2, 4] } });
  });
});
