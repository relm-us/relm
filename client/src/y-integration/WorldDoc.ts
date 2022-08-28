import type { AuthenticationHeaders } from "relm-common";
import type { DecoratedECSWorld, WorldDocStatus } from "~/types";

import * as Y from "yjs";
import { readableMap, YReadableMap } from "svelt-yjs";
import { DeepDiff } from "deep-diff";
import { WebsocketProvider } from "relm-common";

import { Entity, EntityId } from "~/ecs/base";

import {
  findInYArray,
  isEntityAttribute,
  yIdToString,
  withArrayEdits,
  withMapEdits,
  yEntityToJSON,
  yComponentToJSON,
  jsonToYEntity,
  getDeletedItems,
  YEntities,
  YEntity,
  YComponents,
  YComponent,
  YValues,
  YIDSTR,
  PROTECTED_WORLD_DOC_KEYS,
} from "relm-common";

import EventEmitter from "eventemitter3";
import { applyDiffToYEntity } from "./applyDiff";

import { selectedEntities } from "~/stores/selection";
import { uuidv4 } from "~/utils/uuid";
import { Transition } from "~/ecs/plugins/transition";

const UNDO_CAPTURE_TIMEOUT = 50;

export class WorldDoc extends EventEmitter {
  // The Hecs world that this document will synchronize with
  world: DecoratedECSWorld;

  // The "root node" (document) containing all specification data for the world
  ydoc: Y.Doc = new Y.Doc();

  // Yjs synchronization provider
  provider: WebsocketProvider;

  // The array of entities stored in the Y.Doc. We store entities as a Y.Array
  // rather than a Y.Map because, per Yjs docs, this allows nodes to be garbage
  // collected when entities are removed from the Y.Doc.
  entities: YEntities;

  // An array of js objects for chat;
  messages: Y.Array<any>;

  // A map of collaborative documents
  documents: Y.Map<Y.Text>;

  // A map of entryways into this subrelm. Default is [0, 0, 0].
  entryways: YReadableMap<any>;

  // A map of settings for the world
  settings: YReadableMap<any>;

  // A map of state actions to be performed by the server on the world
  actions: YReadableMap<any>;

  // A table of Y.IDs (as strings) mapped to HECS IDs; used for deletion
  yids: Map<YIDSTR, EntityId> = new Map();

  // A table of HECS IDs mapped to YEntity; used for fast lookup
  hids: Map<EntityId, YEntity> = new Map();

  // An UndoManager allowing users to undo/redo edits on `entities`
  undoManager: Y.UndoManager;

  unsubs: Function[] = [];

  constructor(ecsWorld: DecoratedECSWorld) {
    super();

    this.world = ecsWorld;

    this.entities = this.ydoc.getArray("entities");

    const observer = this._observer.bind(this);
    this.entities.observeDeep(observer);
    this.unsubs.push(() => this.entities.unobserveDeep(observer));

    this.messages = this.ydoc.getArray("messages");
    this.documents = this.ydoc.getMap("documents");

    this.entryways = readableMap(this.ydoc.getMap("entryways"));
    this.settings = readableMap(this.ydoc.getMap("settings"));
    this.actions = readableMap(this.ydoc.getMap("actions"));

    this.undoManager = new Y.UndoManager([this.entities], {
      captureTimeout: UNDO_CAPTURE_TIMEOUT,
    });
  }

  connect(
    url: string,
    subrelmDocId: string,
    authHeaders: AuthenticationHeaders
  ) {
    this.provider = new WebsocketProvider(url, subrelmDocId, this.ydoc, {
      params: {
        "participant-id": authHeaders["x-relm-participant-id"],
        "participant-sig": authHeaders["x-relm-participant-sig"],
        "pubkey-x": authHeaders["x-relm-pubkey-x"],
        "pubkey-y": authHeaders["x-relm-pubkey-y"],
        "invite-token": authHeaders["x-relm-token"],
        "jwt": authHeaders["x-relm-jwt"],
      },
      resyncInterval: 10000,
    });
    return this.provider;
  }

  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
  }

  unsubscribe() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;
  }

  subscribeStatus(sub: (status: WorldDocStatus) => void) {
    const provider = this.provider;
    if (provider) {
      provider.on("status", ({ status }) => sub(status));
      this.unsubs.push(() => provider.off("status", sub));
    }
  }

  getDeprecatedDocument(docId: string) {
    if (PROTECTED_WORLD_DOC_KEYS.includes(docId)) {
      console.warn("Tried to get invalid docId", docId);
      return;
    }

    const textNode = this.ydoc.getText(docId);

    if (textNode.toString() !== "") {
      return textNode;
    }
  }

  getDocument(docId: string) {
    let document = this.getDeprecatedDocument(docId);

    if (!document) {
      document = this.documents.get(docId);
      if (document === undefined) {
        document = new Y.Text();
        this.documents.set(docId, document);
      }
    }

    return document;
  }

  reapplyWorld() {
    this.entities.forEach((yentity) => {
      const yid = yIdToString(yentity._item.id);
      if (this.yids.has(yid)) {
        this._applyYEntity(yentity);
      } else {
        this._addYEntity(yentity);
      }
    });
  }

  recomputeStats() {
    console.log("asking server to recompute stats");
    this.settings.y.set("recompute", uuidv4());
  }

  syncFromJSON(json) {
    const hid = json.id;
    let entity;
    if (this.hids.has(hid)) {
      entity = this.world.entities.getById(hid).fromJSON(json);
    } else {
      entity = this.world.entities.create().fromJSON(json).activate();
    }
    this.syncFrom(entity);
  }

  // Update WorldDoc based on any new or updated entity
  syncFrom(entity: Entity) {
    if (this.hids.has(entity.id)) {
      /* Update existing WorldDoc entity */

      const yentity = this.hids.get(entity.id);
      const before = yEntityToJSON(yentity);
      const after = entity.toJSON();

      const diff = DeepDiff(before, after);
      applyDiffToYEntity(diff, yentity, this.ydoc);
    } else {
      /* This entity is new to WorldDoc */
      this._add(entity);
    }

    // Recursively save children entities as well
    for (const child of entity.getChildren()) {
      this.syncFrom(child);
    }
  }

  delete(entity: Entity) {
    if (!entity) {
      console.warn(`Can't delete null entity`);
      return;
    }
    selectedEntities.delete(entity.id);
    this.ydoc.transact(() => {
      this._deleteRecursive(entity);
    });
  }

  deleteById(entityId: string) {
    const entity = this.world.entities.getById(entityId);
    this.delete(entity);
  }

  _deleteRecursive(entity: Entity) {
    const yentity = this.hids.get(entity.id);
    if (!yentity) {
      console.warn(
        `Can't delete entity from worldDoc, does not exist`,
        entity.id
      );
      return;
    }

    // Recursively delete children before parent
    entity.getChildren().forEach((childEntity) => {
      this.delete(childEntity);
    });

    const yid = yentity._item.id;
    findInYArray(
      this.entities,
      (yentity) => yentity.get("id") === entity.id,
      (_yentity, index) => this.entities.delete(index, 1)
    );
    entity.destroy();
    this.yids.delete(yIdToString(yid));
    this.hids.delete(entity.id);
  }

  getJson(entity) {
    const yentity = this.hids.get(entity.id);
    if (yentity) {
      return yEntityToJSON(yentity);
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
    const isUndoRedo =
      transaction.origin && transaction.origin.constructor === Y.UndoManager;

    /**
     * If this is a local event, we should ignore it because the "diff"
     * represented by this YEvent has already been applied to the HECS
     * world. However, if this is a local event generated by the UndoManager,
     * we should treat it as an incoming change and let our observer
     * machinery do its job.
     */
    if (transaction.local && !isUndoRedo) {
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
              this._addYComponent(entity, ycomponent);
            },
            onDelete: (yid) => {
              // The component name we're looking for is a pathLength of 2 within the data structure
              const items = getDeletedItems(event, transaction, 2);
              const componentName = items
                .map((item) => item.content.getContent()[0])
                .find((item) => typeof item === "string");
              if (componentName) {
                entity.removeByName(componentName);
              }
            },
          });
        }
      } else if (event.path.length === 4 && event.path[1] === "components") {
        // Update a component's values
        // e.g. event.path = [ 0, "components", 2, "values" ]
        const entity = this._getEntityFromEventPath(event.path);

        // Retrieve the updated component
        const getComponentFromPath = (path) => {
          const componentName = (
            this.entities
              .get(path[0] as number)
              .get("components") as YComponents
          )
            .get(path[2] as number)
            .get("name") as string;

          return entity.getByName(componentName);
        };

        // Exceptional case is the "Transform" component which controls position, rotation, scale
        // In this case, rather than jumping immediately to the new orientation, we ease gently to it.
        const updateComponentIfRequired = (entity, component, key) => {
          if (component.name === "Transform") {
            if (!entity.has(Transition)) {
              entity.add(Transition);
            }
            component = entity.get(Transition);

            if (key === "position") component.positionSpeed = 0.1;
            if (key === "rotation") component.rotationSpeed = 0.1;
            if (key === "scale") component.scaleSpeed = 0.1;
          }

          return component;
        };

        const onUpdateOrAdd = (key, content) => {
          let component = updateComponentIfRequired(
            entity,
            getComponentFromPath(event.path),
            key
          );

          // Similar to HECS Component.fromJSON, but for just one prop
          const prop = component.constructor.props[key];
          if (!prop) {
            console.warn(
              "updated or added property is null on constructor",
              entity.id,
              key
            );
            return;
          }

          const type = prop.type || prop;
          component[key] = type.fromJSON(content, component[key]);

          // Mark as modified so any updates can occur
          component.modified();
        };

        withMapEdits(event as Y.YMapEvent<YValues>, {
          onUpdate: onUpdateOrAdd,
          onAdd: onUpdateOrAdd,
          onDelete: (removedProperty) => {
            let component = updateComponentIfRequired(
              entity,
              getComponentFromPath(event.path),
              removedProperty
            );

            // Set component property to default value.
            const prop = component.constructor.props[removedProperty];
            if (!prop) {
              console.warn(
                "removed property is null on constructor",
                entity.id,
                removedProperty
              );
              return;
            }

            const type = prop.type || prop;
            component[removedProperty] = type.initial();

            // Mark as modified so any updates can occur
            component.modified();
          },
        });

        // const ycomponent =

        // this._updateYComponent(entity, ycomponent)
      } else {
        console.warn("unknown _observer event", event.path);
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
    // console.log("_addYEntity", yentity, entity);

    // Signal completion of onAdd for tests
    this.emit("entities.added", entity);
  }

  _applyYEntity(yentity: YEntity) {
    const yid = yIdToString(yentity._item.id);
    if (!this.yids.has(yid)) {
      console.warn(`entity not found, won't apply`, yid);
      return;
    }

    const hid = this.yids.get(yid);

    // Convert YEntity hierarchy to HECS-compatible JSON
    const data = yEntityToJSON(yentity);

    const entity = this.world.entities.getById(hid).fromJSON(data);

    // entity.activate();

    this.emit("entities.applied", entity);
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

  _addYComponent(entity: Entity, ycomponent: YComponent) {
    // Get the right Component class
    const key = ycomponent.get("name") as string;
    const Component = this.world.components.getByName(key);

    // Initialize from raw JSON
    const data = yComponentToJSON(ycomponent);
    let component;
    try {
      component = new Component(this.world).fromJSON(data);
    } catch (err) {
      console.warn("unable to add component", key, Component);
      return;
    }

    entity.add(component);

    // Signal completion of onAdd for tests
    this.emit("ycomponents.added", component, entity);
  }
}
