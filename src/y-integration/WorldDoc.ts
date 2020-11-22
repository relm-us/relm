import { World } from "~/types/hecs/World";
import { Component } from "hecs";
import { DeepDiff } from "deep-diff";

import * as Y from "yjs";
import { yIdToString } from "./utils";
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
import { uuidv4 } from "~/utils/uuid";

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

  captureChanges(entity: Entity, changes: Function) {
    const dataBefore = entity.toJSON();
    console.log("dataBefore", dataBefore);
    changes();
    const dataAfter = entity.toJSON();
    console.log("dataAfter", dataAfter);
    const yentity: YEntity = this.hids.get(entity.id);
    // https://github.com/flitbit/diff
    DeepDiff(dataBefore, dataAfter).forEach((delta) => {
      console.log("delta", delta, JSON.stringify(delta));
    });
    // findInYArray(
    //   this.ycomponents,
    //   (ycomponent) => ycomponent.get("name") === Component.name,
    //   (_ycomponent, i) => this.ycomponents.delete(i, 1)
    // );
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
      switch (event.path.length) {
        case 0 /* YEntities */:
          withArrayEdits(event as Y.YArrayEvent<YEntity>, {
            onAdd: (yentity) => {
              const yid = yIdToString(yentity._item.id);
              if (this.yids.has(yid)) {
                console.warn(
                  `entity already exists, won't add`,
                  this.yids.get(yid)
                );
                return;
              }
              console.log("root/onAdd", yentity.toJSON());

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
            },
            onDelete: (yId) => {
              console.log("root/onDelete");
              const id = this.yids.get(yIdToString(yId));
              const entity = this.world.entities.getById(id);

              if (entity) {
                entity.destroy();
                this.emit("entities.deleted", id);
              } else {
                console.warn(`Can't delete entity, not found: ${id}`);
              }
            },
          });
          break;
        case 1 /* YEntity */:
          // console.log("observation YEntity");
          withMapEdits(event as Y.YMapEvent<string | YComponents>, {
            onAdd: (key, ycomponents) => {
              throw new Error(`should add ${key} at initialization instead`);
              // const entity = this.world.entities.getById(yIdToHecsId(yId));

              // if (key === "components") {
              //   const ycomponents = content as YComponents;
              //   ycomponents.forEach((ycomponent) => {
              //     const key = ycomponent.get("name");
              //     const values = ycomponent.get("values") as YValues;
              //     const Component = this.world.components.getByName(key);

              //     entity.add(Component, values.toJSON());
              //   });
              //   this.emit("components.added", ycomponents);
              // } else {
              //   throw new Error(
              //     "add attr other than components not yet supported"
              //   );
              // }
            },
            onUpdate: (key, content, oldContent) => {
              console.log("YEntity/onUpdate", key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              console.log("YEntity/onDelete", key, content, oldContent);
            },
          });
          break;
        case 2 /* YComponents */:
          // console.log("observation YComponents");
          withArrayEdits(event as Y.YArrayEvent<YComponent>, {
            onAdd: (ycomponent) => {
              console.log("YComponents/onAdd");
              const entity = this.getEntityFromEventPath(event.path);

              // Get the right Component class
              const key = ycomponent.get("name");
              const Component = this.world.components.getByName(key);

              // Initialize from raw JSON
              const data = yComponentToJSON(ycomponent);
              const component = new Component(this.world).fromJSON(data);

              entity.add(component);
            },
            onDelete: (yId) => {
              console.log("YComponents/onDelete", yId);
            },
          });
          break;
        case 3 /* YComponent */:
          // console.log("observation YComponent");
          withMapEdits(event as Y.YMapEvent<string | YValues>, {
            onAdd: (key, content) => {
              console.log("YComponent/onAdd", key, content);
            },
            onUpdate: (key, content, oldContent) => {
              console.log("YComponent/onUpdate", key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              console.log("YComponent/onDelete", key, content, oldContent);
            },
          });
          break;
        case 4 /* YValues */:
          // console.log("observation YValues");
          withMapEdits(event as Y.YMapEvent<YValue>, {
            onAdd: (key, content) => {
              console.log("YValues/onAdd", key, content);
            },
            onUpdate: (key, content, oldContent) => {
              console.log("YValues/onUpdate", key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              console.log("YValues/onDelete", key, content, oldContent);
            },
          });
          break;
        default:
          throw new Error(
            `deepObserve too deep: ${JSON.stringify(event.path)}`
          );
      }
    }
  }
}
