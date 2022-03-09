import { PropertyType } from "./Types";
import type { World } from "./World";

export type ComponentProperty = {
  type: PropertyType;
  default?: any;
  defaultFn?: () => any;
  editor?: {
    label?: string;
    input?: string;
    options?: Array<{ label: string; value: string | number }>;
    requires?: Array<{ prop: string; value: string | number | boolean }>;
  };
};

export type Properties = Record<string, ComponentProperty>;

export type StaticProperty = {};

export type TypeOfComponent = typeof Component;

// export type ComponentClass = typeof Component & {
//   props: Properties;
//   editor?: { label: string };
// };
export interface ComponentClass {
  new (): Component;
  props: Properties;
  editor?: { label: string };
}

export class Component {
  name: string;
  world: World;
  props: Array<ComponentProperty>;
  modifiedUntilSystemTick: number;

  static props: Properties = {};
  static isComponent = true;

  constructor(world: World, values = {}) {
    this.world = world;
    this.name = this.constructor.name;
    this.props = [];
    this.modifiedUntilSystemTick = 0;

    const staticProps = (this.constructor as ComponentClass).props;
    for (const key in staticProps) {
      let prop = staticProps[key];
      const value = values[key];

      const initialValue =
        value === undefined
          ? prop.defaultFn
            ? prop.defaultFn()
            : prop.default
          : value;

      this[key] = prop.type.initial(initialValue);
      this.props.push(prop);
    }
  }

  toJSON() {
    const data = {};
    const staticProps = (this.constructor as ComponentClass).props;
    for (const key in staticProps) {
      const prop = staticProps[key];
      // const type = prop.type || prop;
      data[key] = prop.type.toJSON(this[key]);
    }
    return data;
  }

  fromJSON(data) {
    const staticProps = (this.constructor as ComponentClass).props;
    for (const key in staticProps) {
      const prop = staticProps[key];
      // const type = prop.type || prop;
      if (data[key] !== undefined) {
        this[key] = prop.type.fromJSON(data[key], this[key]);
      }
    }
    return this;
  }

  modified() {
    /**
     * When a component is marked as changed it will show up
     * in Modified() queries for one cycle starting from the current
     * system it was changed in and ending in the system that runs
     * before it. See `Query.js` for how change detection is checked
     **/
    this.modifiedUntilSystemTick =
      this.world.systems.tick + this.world.systems.systems.length;
  }
}
