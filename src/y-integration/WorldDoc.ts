import { World } from "~/types/hecs/World";
import { Component } from "hecs";
import { DeepDiff } from "deep-diff";

import * as Y from "yjs";
import { isEntityAttribute, yIdToString } from "./utils";
import { withArrayEdits, withMapEdits } from "./observeUtils";
import {
  YEntities,
  YEntity,
  YMeta,
  YChildren,
  YComponents,
  YComponent,
  YValues,
  YValue,
  YIDSTR,
  HECSID,
} from "./types";
import { yEntityToJSON, yComponentToJSON } from "./yToJson";
import { jsonToYEntity } from "./jsonToY";

import EventEmitter from "eventemitter3";
import { applyChangeToYEntity } from "./applyDiff";

const UNDO_CAPTURE_TIMEOUT = 50;

type Entity = any;
export class WorldDoc extends EventEmitter {
  static index: Map<string, WorldDoc> = new Map();

  // Unique identifier for the world
  name: string;

  // The Hecs world that this document will synchronize with
  world: World;

  // The "root node" (document) containing all specification data for the world
  ydoc: Y.Doc;

  // The array of entities stored in the Y.Doc. We store entities as a Y.Array
  // rather than a Y.Map because, per Yjs docs, this allows nodes to be garbage
  // collected when entities are removed from the Y.Doc.
  entities: YEntities;

  // A record of Y.IDs (as strings) mapped to HECS IDs; used for deletion
  yids: Map<YIDSTR, HECSID>;

  // A record of HECS IDs mapped to YEntity; used for fast lookup
  hids: Map<HECSID, YEntity>;

  // An UndoManager allowing users to undo/redo edits on `entities`
  undoManager: Y.UndoManager;

  constructor(name: string, world: World) {
    super();
    this.name = name;
    this.world = world;
    this.ydoc = new Y.Doc();
    this.entities = this.ydoc.getArray("entities");
    this.yids = new Map();
    this.hids = new Map();
    this.undoManager = new Y.UndoManager([this.entities], {
      captureTimeout: UNDO_CAPTURE_TIMEOUT,
    });
    this.entities.observeDeep(this._observer.bind(this));

    WorldDoc.index.set(name, this);
  }

  transact(fn) {
    this.ydoc.transact((transaction) => {
      fn(this, transaction);
    });
  }

  isTransacting() {
    return this.ydoc._transaction !== null;
  }

  add(entity: Entity) {
    this.ydoc.transact(() => {
      const data = entity.toJSON();
      const yentity = jsonToYEntity(data);
      this.entities.push([yentity]);
    });
  }

  captureChanges(entity: Entity, makeChanges: Function) {
    const dataBefore = entity.toJSON();
    makeChanges();
    const dataAfter = entity.toJSON();

    const yentity: YEntity = this.hids.get(entity.id);
    // https://github.com/flitbit/diff
    const diff = DeepDiff(dataBefore, dataAfter);
    if (diff) {
      this.transact(() => {
        diff.forEach((change) => {
          applyChangeToYEntity(change, yentity);
        });
      });
    } else {
      console.log("no change");
    }
  }

  getEntityFromEventPath(path) {
    if (path.length > 0) {
      const index = path[0] as number;
      const yentity: YEntity = this.entities.get(index);
      const yid = yentity._item.id;
      const hid = this.yids.get(yIdToString(yid));
      return this.world.entities.getById(hid);
    } else {
      throw new Error(`path length must be at least 1`);
    }
  }

  _observer(events: Array<Y.YEvent>) {
    for (const event of events) {
      if (event.path.length === 0) {
        // Adding to or deleting from YEntities
        withArrayEdits(event as Y.YArrayEvent<YEntity>, {
          onAdd: (yentity) => {
            this.addYEntity(yentity);
          },
          onDelete: (yid) => {
            this.deleteYEntity(yid);
          },
        });
      } else if (event.path.length === 2) {
        const entity = this.getEntityFromEventPath(event.path);
        console.log("event.path.length = 2", event.path, entity);
        if (isEntityAttribute(event.path[1] as string)) {
          const attr = event.path[1] as string;
          if (attr === "name") {
            withMapEdits(event as Y.YMapEvent<string>, {
              onUpdate: (key, content) => {
                entity.name = content;
              },
            });
          } else if (attr === "parent") {
            withMapEdits(event as Y.YMapEvent<string>, {
              onUpdate: (key, parentEntityId: string) => {
                const parent = this.world.entities.getById(parentEntityId);
                entity.setParent(parent);
              },
            });
          } else if (attr === "children") {
            withArrayEdits(event as Y.YArrayEvent<string>, {
              onAdd: (childEntityId: string) => {
                const child = this.world.entities.getById(childEntityId);
                child.setParent(entity);
              },
              onDelete: (yid) => {
                console.log("update children onDelete", yid);
              },
            });
          } else {
            throw new Error(`Can't update attribute: ${attr}`);
          }
        } else {
          // Adding to or deleting from YComponents
          withArrayEdits(event as Y.YArrayEvent<YComponent>, {
            onAdd: (ycomponent) => {
              this.addYComponent(ycomponent, entity);
            },
            onDelete: (yid) => {
              this.deleteYComponent(entity, event.path[1] as string);
            },
          });
        }
      }
    }
  }

  addYEntity(yentity: YEntity) {
    const yid = yIdToString(yentity._item.id);
    if (this.yids.has(yid)) {
      console.warn(`entity already exists, won't add`, this.yids.get(yid));
      return;
    }

    // Convert YEntity hierarchy to HECS-compatible JSON
    const data = yEntityToJSON(yentity);

    // Create a HECS entity and immediately initialize it with data
    const entity = this.world.entities.create().fromJSON(data);

    // Keep map of Y.ID to entity.id for potential later deletion
    this.yids.set(yid, entity.id);
    this.hids.set(entity.id, yentity);

    // let ECS know this entity has had all of its initial components added
    entity.activate();

    // Signal completion of onAdd for tests
    this.emit("entities.added", entity);
  }

  deleteYEntity(yid: Y.ID) {
    const id = this.yids.get(yIdToString(yid));
    const entity = this.world.entities.getById(id);

    if (entity) {
      entity.destroy();

      // Signal completion of onDelete for tests
      this.emit("entities.deleted", id);
    } else {
      console.warn(`Can't delete entity, not found: ${id}`);
    }
  }

  addYComponent(ycomponent: YComponent, entity: Entity) {
    // Get the right Component class
    const key = ycomponent.get("name");
    const Component = this.world.components.getByName(key);

    // Initialize from raw JSON
    const data = yComponentToJSON(ycomponent);
    const component = new Component(this.world).fromJSON(data);

    entity.add(component);

    // Signal completion of onAdd for tests
    this.emit("ycomponents.added", component, entity);
  }

  deleteYComponent(entity: Entity, componentName: string) {
    console.log("deleteYComponent", componentName, entity.id);
  }
}
