import { World } from "~/types/hecs/World";

import * as Y from "yjs";
import {
  withArrayEdits,
  withMapEdits,
  YEntities,
  YEntity,
  YComponents,
  YComponent,
  YValues,
  YValue,
  yIdToHecsId,
  addYComponentsToEntity,
} from "./y-utils";
// import { WebsocketProvider } from 'y-websocket';
import { array, map } from "svelt-yjs";
import EventEmitter from "eventemitter3";

const UNDO_CAPTURE_TIMEOUT = 50;

export type EntityStore = {
  subscribe: Function;
  y: YEntities;
};

export class WorldDoc extends EventEmitter {
  static index: Map<string, WorldDoc> = new Map();

  // Unique identifier for the world
  name: string;

  // The Hecs world that this document will synchronize with
  world: World;

  // The "root node" (document) containing all specification data for the world
  ydoc: Y.Doc;

  // A svelt-yjs store that contains a Y.Array of Hecs entity specifications
  entities: EntityStore;

  // An UndoManager allowing users to undo/redo edits on `entities`
  undoManager: Y.UndoManager;

  constructor(name: string, world: World) {
    super();
    this.name = name;
    this.world = world;
    this.ydoc = new Y.Doc();
    // Create the list of entity specification nodes as a Y.Array because
    // per Yjs docs, this allows doc nodes to be garbage collected when needed
    const entitiesArr = this.ydoc.getArray("entities");
    this.entities = array.readable(entitiesArr);
    this.undoManager = new Y.UndoManager([entitiesArr], {
      captureTimeout: UNDO_CAPTURE_TIMEOUT,
    });
    entitiesArr.observeDeep(this._observer.bind(this));

    WorldDoc.index.set(name, this);
  }

  /**
   * Create an entity
   *
   * @param name Name of the entity
   * @param id Unique identifier for the entity
   */
  create(name: string) {
    return new WorldDocEntityBuilder(this.entities.y, name);
  }

  destroy(yentity: YEntity) {
    const yId = yentity._item.id;
    this.entities.y.forEach((yentity, index) => {
      if (Y.compareIDs(yId, yentity._item.id)) {
        this.entities.y.delete(index, 1);
      }
    });
  }

  _observer(events: Array<Y.YEvent>) {
    for (const event of events) {
      switch (event.path.length) {
        case 0 /* YEntities */:
          withArrayEdits(event as Y.YArrayEvent<YEntity>, {
            onAdd: (yId, content) => {
              const entity = this.world.entities.create(
                content.get("name"),
                yIdToHecsId(yId)
              );
              const ycomponents = content.get("components") as YComponents;
              addYComponentsToEntity(entity, ycomponents);
              entity.activate();

              // Emitting here makes writing tests easier
              this.emit("entities.added", entity);
            },
            onDelete: (yId) => {
              const id = yIdToHecsId(yId);
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
            onAdd(yId, key, content) {
              // console.log("  key add:", yId, key, content);
            },
            onUpdate(yId, key, content, oldContent) {
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete(yId, key) {
              // console.log("  key delete:", yId, key);
            },
          });
          break;
        case 2 /* YComponents */:
          // console.log("observation YComponents");
          withArrayEdits(event as Y.YArrayEvent<YComponents>, {
            onAdd(yId, content) {
              // console.log("  added:", yId, content);
            },
            onDelete(yId) {
              // console.log("  deleted", yId);
            },
          });
          break;
        case 3 /* YComponent */:
          // console.log("observation YComponent");
          withMapEdits(event as Y.YMapEvent<string | YValues>, {
            onAdd(yId, key, content) {
              // console.log("  key add:", yId, key, content);
            },
            onUpdate(yId, key, content, oldContent) {
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete(yId, key) {
              // console.log("  key delete:", yId, key);
            },
          });
          break;
        case 4 /* YValues */:
          // console.log("observation YValues");
          withMapEdits(event as Y.YMapEvent<YValue>, {
            onAdd(yId, key, content) {
              // console.log("  key add:", yId, key, content);
            },
            onUpdate(yId, key, content, oldContent) {
              // console.log("  key update:", yId, key, content, oldContent);
            },
            onDelete(yId, key) {
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

export class WorldDocEntityBuilder {
  builder: Array<Function>;
  entitiesArr: YEntity;
  yentity: YEntity;
  ycomponents: YComponents;

  constructor(entitiesArr, name: string) {
    this.entitiesArr = entitiesArr;
    this.builder = [];
    this.builder.push((entitiesArr) => {
      this.yentity = new Y.Map();

      entitiesArr.push([this.yentity]);

      this.yentity.set("name", name);

      this.ycomponents = new Y.Array();
      this.yentity.set("components", this.ycomponents);
    });
  }

  add(Component: any, values: object) {
    const component = new Component(null, values);

    this.builder.push((entitiesArr) => {
      const ycomponent: YComponent = new Y.Map();

      this.ycomponents.push([ycomponent]);

      ycomponent.set("name", Component.name);

      const yvalues: YValues = new Y.Map();
      ycomponent.set("values", yvalues);

      const json = component.toJSON();
      for (const [key, prop] of Object.entries(json)) {
        yvalues.set(key, prop as YValue);
      }
    });

    return this;
  }

  build() {
    this.entitiesArr.doc.transact((_transaction) => {
      for (const step of this.builder) {
        step(this.entitiesArr);
      }
    }, "WorldDocEntityBuilder");

    return this.yentity;
  }
}
