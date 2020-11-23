import { World } from "~/types/hecs/World";
import { DeepDiff } from "deep-diff";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { isBrowser, isNode, isNodeEnv } from "~/utils/isBrowser";
import { isEntityAttribute, yIdToString } from "./utils";
import { withArrayEdits, withMapEdits } from "./observeUtils";
import { YEntities, YEntity, YComponent, YIDSTR, HECSID } from "./types";
import { yEntityToJSON, yComponentToJSON } from "./yToJson";
import { jsonToYEntity } from "./jsonToY";

import EventEmitter from "eventemitter3";
import { applyChangeToYEntity } from "./applyDiff";
import { Change } from "./diffTypes";

const UNDO_CAPTURE_TIMEOUT = 50;

type ConnectOptions = {
  url: string;
};

type Entity = any;
export class WorldDoc extends EventEmitter {
  static index: Map<string, WorldDoc> = new Map();

  // Unique identifier for the world
  name: string;

  // The Hecs world that this document will synchronize with
  world: World;

  // The "root node" (document) containing all specification data for the world
  ydoc: Y.Doc;

  // Yjs synchronization provider
  provider: WebsocketProvider;

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

  constructor({
    name,
    world,
    connection,
  }: {
    name: string;
    world: World;
    connection?: ConnectOptions;
  }) {
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

    if (connection) {
      this.connect(connection);
    }

    WorldDoc.index.set(name, this);
  }

  connect(connection: ConnectOptions) {
    this.provider = new WebsocketProvider(connection.url, this.name, this.ydoc);
  }

  // Update WorldDoc based on any new or updated entity
  syncFrom(entity: Entity) {
    if (this.hids.has(entity.id)) {
      /* Update existing WorldDoc entity */

      const yentity = this.hids.get(entity.id);
      const before = yEntityToJSON(yentity);
      const after = entity.toJSON();

      const diff = DeepDiff(before, after);
      if (diff) {
        this.ydoc.transact(() => {
          diff.forEach((change: Change) => {
            applyChangeToYEntity(change, yentity);
          });
        });
      }
    } else {
      /* This entity is new to WorldDoc */

      this._add(entity);
    }
  }

  _add(entity: Entity) {
    this.ydoc.transact(() => {
      const data = entity.toJSON();
      const yentity = jsonToYEntity(data);
      this.entities.push([yentity]);
      this.yids.set(yIdToString(yentity._item.id), entity.id);
      this.hids.set(entity.id, yentity);
    });
  }

  _getEntityFromEventPath(path) {
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

  _observer(events: Array<Y.YEvent>, transaction: Y.Transaction) {
    // If this is a local event, we should ignore it because the "diff"
    // represented by this YEvent has already been applied to the HECS
    // world.
    if (transaction.local) {
      return;
    }

    for (const event of events) {
      if (event.path.length === 0) {
        // Adding to or deleting from YEntities
        withArrayEdits(event as Y.YArrayEvent<YEntity>, {
          onAdd: (yentity) => {
            this._addYEntity(yentity);
          },
          onDelete: (yid) => {
            this._deleteYEntity(yid);
          },
        });
      } else if (event.path.length === 2) {
        const entity = this._getEntityFromEventPath(event.path);

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
              this._addYComponent(ycomponent, entity);
            },
            onDelete: (yid) => {
              this._deleteYComponent(entity, event.path[1] as string);
            },
          });
        }
      }
    }
  }

  _addYEntity(yentity: YEntity) {
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

  _deleteYEntity(yid: Y.ID) {
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

  _addYComponent(ycomponent: YComponent, entity: Entity) {
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

  _deleteYComponent(entity: Entity, componentName: string) {
    console.log("deleteYComponent", componentName, entity.id);
  }
}
