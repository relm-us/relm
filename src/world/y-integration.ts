import { World } from "~/types/hecs/World";

import * as Y from "yjs";
// import { WebsocketProvider } from 'y-websocket';
import { array, map } from "svelt-yjs";

const UNDO_CAPTURE_TIMEOUT = 50;

export type EntityStore = {
  subscribe: Function;
  y: Y.Array<EntityElement>;
};

export class WorldDoc {
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

    WorldDoc.index.set(name, this);
  }

  /**
   * Create an entity
   *
   * @param name Name of the entity
   * @param id Unique identifier for the entity
   */
  create(name: string) {
    const helper = new EntityElementHelper(name);
    this.entities.y.push([helper.element]);
    return helper;
  }
}

export class EntityElementHelper {
  name: string;
  components: Y.Array<ComponentPart>;

  constructor(name: string) {
    this.name = name;
    this.components = new Y.Array();
  }

  get element(): EntityElement {
    return {
      name: this.name,
      components: this.components,
    };
  }

  add(component: any, values: object) {
    const element: ComponentPart = {
      name: component.constructor.name,
      values,
    };
    this.components.push([element]);

    return this;
  }
}

export type EntityElement = {
  name: string;
  components: Y.Array<ComponentPart>;
};

export type ComponentPart = {
  name: string;
  values: object;
};
