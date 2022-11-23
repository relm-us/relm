import { Entity } from "~/ecs/base";
import { sortAlphabetically } from "./sortAlphabetically";

export function getComponentOptions(entity: Entity) {
  const entityComponentNames = entity.Components.map((c) => c.name);
  const components = Object.values(entity.world.components.components)
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
