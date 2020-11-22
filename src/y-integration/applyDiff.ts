import * as Y from "yjs";
import { applyChange } from "deep-diff";
import { DiffKind, Diff } from "./diffTypes";
import { jsonToYComponent } from "./jsonToY";
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

import { isEntityAttribute, findInYArray } from "./utils";

export function applyDiffToYEntity(diff: Diff, yentity: YEntity) {
  const key: number | string = diff.path[0];

  switch (diff.kind) {
    case DiffKind.Array:
      throw new Error(`Can't handle array diff yet`);
    default:
      // the Entity's component or attribute changed
      if (diff.path.length === 1) {
        if (isEntityAttribute(key as string)) {
          if (diff.kind === DiffKind.Update) {
            switch (key) {
              case "id":
                throw new Error(`Not allowed to update entity ID`);
              case "name":
              case "parent":
                yentity.set(key, diff.rhs);
                break;
              case "children":
                throw new Error(`Not implemented`);
                // const ychildren: YChildren = yentity.get("children");
                break;
              case "meta":
                throw new Error(`Not implemented`);
                // const ychildren: YChildren = yentity.get("children");
                break;
            }
          } else {
            throw new Error(`Only 'Update' supported on entity attributes`);
          }
        } else {
          // Components
          if (diff.kind === DiffKind.Add) {
            let ycomponents = yentity.get("components") as YComponents;
            if (!ycomponents) {
              ycomponents = new Y.Array();
              yentity.set("components", ycomponents);
            }

            const ycomponent = jsonToYComponent(key as string, diff.rhs);

            ycomponents.push([ycomponent]);
            //TODO: should we capture the case where overwriting an existing component sets .modified()?
          } else if (diff.kind === DiffKind.Delete) {
            let ycomponents = yentity.get("components") as YComponents;
            if (!ycomponents) return;

            findInYArray(
              ycomponents,
              (ycomponent) => ycomponent.get("name") === key,
              (_ycomponent, index) => ycomponents.delete(index, 1)
            );
          }
        }
      } else if (diff.path.length > 2) {
        if (isEntityAttribute(key as string)) {
          throw new Error(`Attributes must be primitive types '${key}'`);
        } else {
          let ycomponents = yentity.get("components") as YComponents;
          if (ycomponents) {
            findInYArray(
              ycomponents,
              (ycomponent) => ycomponent.get("name") === key,
              (ycomponent, _index) => {
                const yvalues = ycomponent.get("values") as YValues;
                const property = diff.path[1] as string;

                // Remove first two parts of path: Component, property
                diff.path = diff.path.slice(2);
                const value = yvalues.get(property);
                applyChange(value, null, diff);

                // We modified in-place, so re-assign
                yvalues.set(property, value);
              }
            );
          } else {
            throw new Error(`YEntity has no components '${yentity.get("id")}'`);
          }
        }
      } else {
        console.log("diff.path", diff.path);
      }
  }
}
