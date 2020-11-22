import { World } from "~/types/hecs/World";
import { Entity } from "hecs";

import * as Y from "yjs";
import {
  withArrayEdits,
  withMapEdits,
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
  yIdToString,
  yEntityToJSON,
} from "./y-utils";
import EventEmitter from "eventemitter3";
import { uuidv4 } from "~utils/uuid";

const UNDO_CAPTURE_TIMEOUT = 50;

class YEntityManager {
  worldDoc: WorldDoc;

  yentity: YEntity;
  ychildren: YChildren;
  ymeta: YMeta;
  ycomponents: YComponents;

  builder: Builder;

  constructor(worldDoc: WorldDoc, yentity: YEntity = null) {
    this.worldDoc = worldDoc;
    this.builder = new Builder(worldDoc.ydoc);
    if (yentity) {
      this.yentity = yentity;
      this.ychildren = yentity.get("children") as YChildren;
      this.ymeta = yentity.get("meta") as YMeta;
      this.ycomponents = yentity.get("components") as YComponents;
    } else {
      this.yentity = new Y.Map();
      this.ychildren = new Y.Array();
      this.ymeta = new Y.Map();
      this.ycomponents = new Y.Array();
    }
  }

  init(name: string, id: string) {
    this.builder.add(() => {
      this.worldDoc.entities.push([this.yentity]);

      this.yentity.set("id", id);
      this.yentity.set("name", name);
      this.yentity.set("parent", null);
      this.yentity.set("children", this.ychildren);
      this.yentity.set("meta", this.ymeta);
      this.yentity.set("components", this.ycomponents);
    });
  }
}

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
  // entities: YEntityManager;

  // A record of Y.IDs (as strings) mapped to HECS IDs; used for deletion
  yids: Map<YIDSTR, HECSID>;

  // A record of HECS IDs mapped to YEntity; used for fast lookup
  hids: Map<HECSID, YEntityManager>;

  // An UndoManager allowing users to undo/redo edits on `entities`
  undoManager: Y.UndoManager;

  constructor(name: string, world: World) {
    super();
    this.name = name;
    this.world = world;
    this.ydoc = new Y.Doc();
    this.entities = this.ydoc.getArray("entities");
    this.undoManager = new Y.UndoManager([this.entities], {
      captureTimeout: UNDO_CAPTURE_TIMEOUT,
    });
    this.entities.observeDeep(this._observer.bind(this));

    WorldDoc.index.set(name, this);
  }

  /**
   * Create an entity
   *
   * @param name Name of the entity
   * @param id Unique identifier for the entity
   */
  create(name: string, id: string = uuidv4()) {
    // return new WorldDocEntityBuilder(this, name, id);
    const mgr = new YEntityManager(this);
    this.hids.set(id, mgr);
    return mgr;
  }

  getById(id: HECSID) {
    return this.hids.get(id);
  }

  destroy(yId: Y.ID) {
    this.entities.forEach((yentity, index) => {
      if (Y.compareIDs(yId, yentity._item.id)) {
        this.entities.delete(index, 1);
      }
    });
  }

  addComponent(yId: Y.ID, Component: any, values: object) {
    const yentity = Y.getItem(this.ydoc.store, yId).content.getContent()[0];
    const component = new Component(null, values);
    this.ydoc.transact((_transaction) => {
      createYComponent(
        yentity.get("components"),
        Component.name,
        component.toJSON()
      );
    });
  }

  /*
  getEntityFromEventPath(path) {
    if (path.length > 0) {
      const index = path[0] as number;
      const yentity: YEntity = this.entities.y.get(index);
      const yId = yentity._item.id;
      const id = yIdToHecsId(yId);
      return this.world.entities.getById(id);
    } else {
      throw new Error(`path length must be at least 1`);
    }
  }
  */

  _observer(events: Array<Y.YEvent>) {
    for (const event of events) {
      switch (event.path.length) {
        case 0 /* YEntities */:
          withArrayEdits(event as Y.YArrayEvent<YEntity>, {
            onAdd: (yentity) => {
              // Convert YEntity hierarchy to HECS-compatible JSON
              const data = yEntityToJSON(yentity);

              // Create a HECS entity and immediately initialize it with data
              const entity = new Entity(this.world).fromJSON(data);

              // Keep map of Y.ID to entity.id for potential later deletion
              this.yids.set(yIdToString(yentity._item.id), entity.id);
              this.hids.set(entity.id, yentity);

              // let ECS know this entity has had all of its initial components added
              entity.activate();

              // Signal completion of onAdd for tests
              this.emit("entities.added", entity);
            },
            onDelete: (yId) => {
              const id = this.ids.get(yIdToString(yId));
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
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              // console.log("  key delete:", yId, key);
            },
          });
          break;
        case 2 /* YComponents */:
          // console.log("observation YComponents");
          withArrayEdits(event as Y.YArrayEvent<YComponent>, {
            onAdd: (ycomponent) => {
              const entity = this.getEntityFromEventPath(event.path);

              const key = ycomponent.get("name");
              const values = ycomponent.get("values") as YValues;
              const Component = this.world.components.getByName(key);

              entity.add(Component, values.toJSON());
            },
            onDelete: (yId) => {
              // console.log("  deleted", yId);
            },
          });
          break;
        case 3 /* YComponent */:
          // console.log("observation YComponent");
          withMapEdits(event as Y.YMapEvent<string | YValues>, {
            onAdd: (key, content) => {
              // console.log("  key add:", yId, key, content);
            },
            onUpdate: (key, content, oldContent) => {
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              // console.log("  key delete:", yId, key);
            },
          });
          break;
        case 4 /* YValues */:
          // console.log("observation YValues");
          withMapEdits(event as Y.YMapEvent<YValue>, {
            onAdd: (key, content) => {
              // console.log("  key add:", yId, key, content);
            },
            onUpdate: (key, content, oldContent) => {
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete: (key, content, oldContent) => {
              // console.log("  key delete:", yId, key);
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

export class Builder {
  ydoc: Y.Doc;
  steps: Array<Function> = [];

  constructor(ydoc: Y.Doc) {
    this.ydoc = ydoc;
  }

  add(step: Function) {
    this.steps.push(step);
  }

  build() {
    this.ydoc.transact((_transaction) => {
      this.steps.forEach((step) => step());
    }, "builder");
  }
}

// worldDoc.create()
// worldDoc.get('0:1').add(Transform, {})

// class YEntityManager {
//   worldDoc: WorldDoc;

//   // The array of entities stored in the Y.Doc. We store entities as a Y.Array
//   // rather than a Y.Map because, per Yjs docs, this allows nodes to be garbage
//   // collected when entities are removed from the Y.Doc.
//   entities: YEntities;

//   constructor(worldDoc: WorldDoc) {
//     this.worldDoc = worldDoc
//     this.
//   }
// }
export class WorldDocEntityBuilder {
  worldDoc: WorldDoc;
  id: string;
  name: string;

  yentity: YEntity = new Y.Map();
  ychildren: YChildren = new Y.Array();
  ymeta: YMeta = new Y.Map();
  ycomponents: YComponents = new Y.Array();

  builder: Array<Function> = [];

  constructor(worldDoc: WorldDoc, name: string, id: string) {
    this.worldDoc = worldDoc;
    this.id = id;
    this.name = name;

    this.builder.push(() => {
      worldDoc.entities.push([this.yentity]);

      this.yentity.set("id", id);
      this.yentity.set("name", name);
      this.yentity.set("parent", null);
      this.yentity.set("children", this.ychildren);
      this.yentity.set("meta", this.ymeta);
      this.yentity.set("components", this.ycomponents);
    });
  }

  add(Component: any, values: object) {
    this.builder.push(() => {
      const component = new Component(null, values);
      createYComponent(this.ycomponents, Component.name, component.toJSON());
    });

    return this;
  }

  build() {
    this.entitiesArr.doc.transact((_transaction) => {
      this.builder.forEach((step) => step());
    }, "WorldDocEntityBuilder");

    return this.yentity;
  }
}

function createYComponent(
  ycomponents: YComponents,
  componentName: string,
  componentAttrs: object
) {
  const ycomponent: YComponent = new Y.Map();

  ycomponents.push([ycomponent]);

  ycomponent.set("name", componentName);

  const yvalues: YValues = new Y.Map();
  ycomponent.set("values", yvalues);

  for (const [key, prop] of Object.entries(componentAttrs)) {
    yvalues.set(key, prop as YValue);
  }

  return ycomponent;
}
