import * as Y from "yjs";
import { applyChange } from "deep-diff";
import { ChangeKind, Change, Diff } from "./diffTypes";
import {
  YEntity,
  YChildren,
  YComponents,
  YValues,
  jsonToYComponent,
  isEntityAttribute,
  findInYArray,
} from "relm-common";

export function applyChangeToYEntity(change: Change, yentity: YEntity) {
  const key: number | string = change.path[0];

  switch (change.kind) {
    case ChangeKind.Array:
      if (key === "children") {
        if (change.item.kind === ChangeKind.Add) {
          const ychildren = yentity.get("children") as YChildren;
          ychildren.push([change.item.rhs]);
        } else {
          throw new Error(
            `Not supported on children yet: '${change.item.kind}'`
          );
        }
      } else {
        throw new Error(
          `Can't handle array change for path: '${JSON.stringify(change.path)}'`
        );
      }
      break;
    default:
      // the Entity's component or attribute changed
      if (change.path.length === 1) {
        if (isEntityAttribute(key as string)) {
          if (change.kind === ChangeKind.Update) {
            switch (key) {
              case "id":
                throw new Error(`Not allowed to update entity ID`);
              case "name":
              case "parent":
                yentity.set(key, change.rhs);
                break;
              case "children":
                throw new Error(`Should be handled by ChangeKind.Array`);
              case "meta":
                throw new Error(`Not implemented`);
                // const ychildren: YChildren = yentity.get("children");
                break;
            }
          } else {
            throw new Error(
              `Only 'Update' supported on entity attributes: '${change.kind}'`
            );
          }
        } else {
          // Components
          if (change.kind === ChangeKind.Add) {
            let ycomponents = yentity.get("components") as YComponents;

            // Make sure we have a YComponents array
            if (!ycomponents) {
              ycomponents = new Y.Array();
              yentity.set("components", ycomponents);
            }

            // Add new YComponent
            const ycomponent = jsonToYComponent(key as string, change.rhs);
            ycomponents.push([ycomponent]);
            //TODO: should we capture the case where overwriting an existing component sets .modified()?
          } else if (change.kind === ChangeKind.Delete) {
            let ycomponents = yentity.get("components") as YComponents;
            if (!ycomponents) return;

            findInYArray(
              ycomponents,
              (ycomponent) => ycomponent.get("name") === key,
              (_ycomponent, index) => ycomponents.delete(index, 1)
            );
          }
        }
      } else if (change.path.length >= 2) {
        const componentName = change.path[0] as string;
        const propertyName = change.path[1] as string;
        if (isEntityAttribute(key as string))
          throw new Error(`Attributes must be primitive types '${key}'`);
        if (change.path.length === 2) {
          // Set a Component property primitive, e.g. shape.sphereRadius = 1.0
          if (
            change.kind === ChangeKind.Update ||
            change.kind === ChangeKind.Add
          ) {
            withYComponentValues(yentity, componentName, (yvalues) => {
              yvalues.set(propertyName, change.rhs);
            });
          } else if (change.kind === ChangeKind.Delete) {
            withYComponentValues(yentity, componentName, (yvalues) => {
              yvalues.delete(propertyName);
            });
          } else {
            throw new Error(`Change not implemented: '${change.kind}'`);
          }
        } else if (change.path.length > 2) {
          // Add, update, or delete a compound Component property,
          //   e.g. transform.position = new Vector3(0, 0, 1)
          withYComponentValues(yentity, componentName, (yvalues) => {
            // Remove first two parts of path: component name, & property
            change.path.shift();
            change.path.shift();
            const value = yvalues.get(propertyName);

            /**
             * We need to create new references here and avoid modifying-in-place, or
             * else Yjs will not detect that a change occurred and undo/redo will fail.
             *
             * Check https://discuss.yjs.dev/t/indicate-to-yjs-that-content-has-been-modified/302
             */
            if (value instanceof Array) {
              const newValue = [...value];
              applyChange(newValue, null, change);
              yvalues.set(propertyName, newValue);
            } else if (value instanceof Object) {
              const newValue = { ...value };
              applyChange(newValue, null, change);
              yvalues.set(propertyName, newValue);
            } else {
              applyChange(value, null, change);
              yvalues.set(propertyName, value);
            }
          });
        } else {
          throw new Error(`Can't happen`);
        }
      } else {
        throw new Error(`Did not handle change case ${JSON.stringify(change)}`);
      }
  }
}

export function applyDiffToYEntity(diff: Diff, yentity: YEntity, ydoc) {
  if (diff) {
    ydoc.transact(() => {
      diff.forEach((change: Change) => {
        applyChangeToYEntity(change, yentity);
      });
    });
  }
}

function withYComponentValues(
  yentity: YEntity,
  componentName: string,
  fn: (yvalues) => void
) {
  let ycomponents = yentity.get("components") as YComponents;
  if (ycomponents) {
    findInYArray(
      ycomponents,
      (ycomponent) => ycomponent.get("name") === componentName,
      (ycomponent, _index) => {
        const yvalues = ycomponent.get("values") as YValues;
        fn(yvalues);
      }
    );
  } else {
    throw new Error(`YEntity is missing YComponents: '${yentity.get("id")}'`);
  }
}
