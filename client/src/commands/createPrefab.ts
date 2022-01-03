import { worldManager } from "~/world";
import { WorldTransform } from "~/ecs/plugins/core";
import { directory } from "~/prefab";

function activate(entity) {
  entity.activate();
  worldManager.worldDoc.syncFrom(entity);
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
    const position = worldManager.identities.me.avatar.position;
    if (position) {
      const x = position.x;
      const z = position.z;

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
