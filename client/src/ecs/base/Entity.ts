import { World } from "./World";
import { Component, TypeOfComponent } from "./Component";
import { StateComponent } from "./StateComponent";

type MaybeUnboundEntity = string | Entity;

export class Entity {
  name: string;
  world: World;
  id: string;
  meta: object;
  Components: Array<TypeOfComponent>;
  components: Map<TypeOfComponent, Component>;
  parent: MaybeUnboundEntity;
  children: Array<MaybeUnboundEntity>;
  inactiveComponents: Array<Component>;
  archetypeId: string;

  needsBind: boolean;
  active: boolean;
  deactivating: boolean;
  destroying: boolean;

  constructor(world: World, name?: string, id?: string, meta?) {
    this.world = world;
    this.id = id;
    this.name = name || null;
    this.meta = meta || {};
    this.Components = [];
    this.components = new Map();
    this.parent = null;
    this.children = [];
    this.needsBind = false;
    this.inactiveComponents = [];
    this.archetypeId = world.archetypes.initialId;
    this.active = false;
  }

  add(Component, values?, ret = false) {
    let component;
    if (!Component.isComponent) {
      component = Component;
      Component = Component.constructor;
    } else {
      component = new Component(this.world, values);
    }
    const replacing = this.components.has(Component);
    this.components.set(Component, component);
    if (replacing) {
      component.modified();
    } else {
      this.Components.push(Component);
      this.world.archetypes.onEntityComponentChange(this, Component, true);
    }
    return ret ? component : this;
  }

  addByName(componentName: string, values?, ret = false) {
    const Component = this.world.components.getByName(componentName);
    return this.add(Component, values, ret);
  }

  // TODO: can we return type information here?
  get(Component: TypeOfComponent): any {
    return this.components.get(Component);
  }

  getByName(componentName: string) {
    const Component = this.world.components.getByName(componentName);
    return this.get(Component);
  }

  has(Component: TypeOfComponent) {
    return !!this.components.get(Component);
  }

  hasByName(componentName: string) {
    const Component = this.world.components.getByName(componentName);
    return this.has(Component);
  }

  remove(Component: TypeOfComponent): Entity {
    if (!this.components.has(Component)) {
      console.warn("Entity: cannot remove component as it doesnt have one");
      return;
    }
    this.components.delete(Component);
    const idx = this.Components.indexOf(Component);
    this.Components.splice(idx, 1);
    this.world.archetypes.onEntityComponentChange(this, Component, false);
    if (!this.Components.length && (this.deactivating || this.destroying)) {
      this.active = false;
      this.deactivating = false;
      this.destroying = false;
      this.world.entities.onEntityInactive(this);
      this.world.archetypes.onEntityInactive(this);
    }
    return this;
  }

  bind() {
    if (!this.needsBind) return;
    // After deserializing an entity we need to bind the parent and child ID's to actual entities...
    this.parent = this.parent ? this.world.entities.getById(this.parent) : null;
    this.children = this.children.map((id) => this.world.entities.getById(id));
    this.needsBind = false;
  }

  setParent(entity: Entity) {
    // remove current parent (if any)
    this.bind();
    if (this.parent) {
      (this.parent as Entity).bind();
      const idx = (this.parent as Entity).children.indexOf(this);
      (this.parent as Entity).children.splice(idx, 1);
      this.parent = null;
    }
    // add new parent (if any)
    if (entity) {
      this.parent = entity;
      this.parent.children.push(this);
    }
    return this;
  }

  getParent(): Entity {
    this.bind();
    return this.parent as Entity;
  }

  getChildren(): Array<Entity> {
    this.bind();
    return this.children as Array<Entity>;
  }

  traverse(callback: (e: Entity) => void) {
    this.bind();
    callback(this);
    for (let i = 0; i < this.children.length; i++) {
      (this.children[i] as Entity).traverse(callback);
    }
  }

  traverseAncestors(callback: (e: Entity) => void) {
    this.bind();
    let parent = this.parent as Entity;
    while (parent) {
      callback(parent);
      parent.bind();
      parent = parent.parent as Entity;
    }
  }

  activate() {
    if (this.active) {
      console.warn("Entity: cannot activate as entity is already active");
      return;
    }
    while (this.inactiveComponents.length) {
      const component = this.inactiveComponents.pop();
      const Component = component.constructor as TypeOfComponent;
      this.components.set(Component, component);
      this.Components.push(Component);
      this.world.archetypes.onEntityComponentChange(this, Component, true);
    }
    this.active = true;
    this.deactivating = false;
    this.destroying = false;
    this.world.entities.onEntityActive(this);
    this.world.archetypes.onEntityActive(this);
    return this;
  }

  deactivate() {
    /**
     * Temporarily removes all Components except StateComponents.
     * If there are no StateComponents the entity is immediately removed
     * from the world and all queries.
     * If any StateComponents do exist then the entity stays active until
     * systems have removed all StateComponents.
     */
    for (let i = this.Components.length - 1; i >= 0; --i) {
      const Component = this.Components[i];
      if ((Component as any).__proto__ === StateComponent) {
        this.deactivating = true;
      } else {
        const component = this.components.get(Component);
        this.components.delete(Component);
        this.Components.splice(i, 1);
        this.inactiveComponents.push(component);
        this.world.archetypes.onEntityComponentChange(this, Component, false);
      }
    }
    if (!this.deactivating) {
      this.active = false;
      this.world.entities.onEntityInactive(this);
      this.world.archetypes.onEntityInactive(this);
    }
    return this;
  }

  destroy() {
    /**
     * Removes all Components except StateComponents.
     * If there are no StateComponents the entity is removed from the world and
     * all queries immediately.
     * If any StateComponents do exist then the entity stays active until
     * systems have removed all StateComponents.
     */
    for (let i = this.Components.length - 1; i >= 0; --i) {
      const Component = this.Components[i];
      if ((Component as any).__proto__ === StateComponent) {
        this.destroying = true;
      } else {
        this.components.delete(Component);
        this.Components.splice(i, 1);
        this.world.archetypes.onEntityComponentChange(this, Component, false);
      }
    }
    if (!this.destroying) {
      this.active = false;
      this.world.entities.onEntityInactive(this);
      this.world.archetypes.onEntityInactive(this);
    }
    this.bind();
    for (let i = 0; i < this.children.length; i++) {
      (this.children[i] as Entity).destroy();
    }
    return this;
  }

  toJSON() {
    let children;
    try {
      children = this.getChildren().map((child) => child.id);
    } catch (err) {
      children = [];
      console.warn(
        `Can't get children of '${this.id}' (${this.name}):`,
        err.message
      );
    }
    const data = {
      id: this.id,
      name: this.name,
      parent: this.getParent()?.id || null,
      children,
      meta: { ...this.meta },
    };
    this.components.forEach((component) => {
      if ((component.constructor as any).__proto__ === Component) {
        data[component.name] = component.toJSON();
      }
    });
    return data;
  }

  fromJSON(data) {
    this.id = data.id;
    this.name = data.name;
    this.parent = data.parent;
    this.children = data.children;
    this.meta = data.meta;
    for (const key in data) {
      if (
        key === "id" ||
        key === "name" ||
        key === "parent" ||
        key === "children" ||
        key === "meta"
      )
        continue;
      const Component = this.world.components.getByName(key);
      if (Component) {
        this.add(Component, undefined, true).fromJSON(data[key]);
      } else {
        console.warn(
          `Can't add missing component: '${key}' to ${this.id} (${this.name})`
        );
      }
    }
    this.needsBind = true;
    return this;
  }
}
