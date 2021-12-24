import { get } from "svelte/store";
import { worldManager } from "~/world";
import { worldDoc } from "~/stores/worldDoc";
import { WorldTransform } from "~/ecs/plugins/core";
import { directory } from "~/prefab";

function activate(entity) {
  entity.activate();
  get(worldDoc).syncFrom(entity);
  for (const child of entity.getChildren()) {
    activate(child);
  }
}

export const createPrefab = {
  params: {
    prefab: {
      label: "Prefab",
      type: "select",
      options: directory.map((entry) => ({
        label: entry.name,
        value: entry.prefab,
      })),
    },
  },
  // TODO: remove first arg
  command: ({ name, src }, props) => {
    const transform = worldManager.avatar.entity?.get(WorldTransform);
    if (transform) {
      const x = transform.position.x;
      const z = transform.position.z;

      const prefab = directory.find((item) => item.name === name);
      if (prefab) {
        let entities = prefab.prefab(worldManager.world, {
          ...props,
          x,
          z,
          url: src,
        });
        if (!(entities instanceof Array)) entities = [entities];

        for (const entity of entities) {
          activate(entity);
        }
      } else {
        console.error(`Prefab not found: '${name}'`);
      }
    } else {
      console.error(`Can't create prefab, avatar not found`);
    }
  },
};
