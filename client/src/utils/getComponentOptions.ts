import type { DecoratedECSWorld } from "~/types";
import { Entity } from "~/ecs/base";
import { sortAlphabetically } from "./sortAlphabetically";

export function getComponentOptions(world: DecoratedECSWorld, entity: Entity = null) {
  const entityComponentNames = entity?.Components.map((c) => c.name);
  const components = Object.values(world.components.componentsByName)
    .filter((Component: any) => {
      return (
        Component.editor &&
        !Component.isStateComponent &&
        (!entity || !entityComponentNames.includes(Component.name))
      );
    })
    .map((Component: any) => ({
      label: Component.editor?.label || Component.name,
      value: Component.name,
    }));
  sortAlphabetically(components, (c) => c.label);
  return components;
}
