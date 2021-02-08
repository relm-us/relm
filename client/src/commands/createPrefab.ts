import { WorldTransform } from "~/ecs/plugins/core";
import { directory } from "~/prefab";
import { assetUrl } from "~/stores/config";

function activate($worldManager, entity) {
  entity.activate();
  $worldManager.wdoc.syncFrom(entity);
  for (const child of entity.getChildren()) {
    activate($worldManager, child);
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
  command: ($worldManager, { name, src }, props) => {
    const transform = $worldManager.avatar?.get(WorldTransform);
    if (transform) {
      const x = transform.position.x;
      const z = transform.position.z;

      const prefab = directory.find((item) => item.name === name);
      if (prefab) {
        const url = assetUrl(src);
        let entities = prefab.prefab($worldManager.world, {
          ...props,
          x,
          z,
          url,
        });
        if (!(entities instanceof Array)) entities = [entities];

        for (const entity of entities) {
          activate($worldManager, entity);
        }
      } else {
        console.error(`Prefab not found: '${name}'`);
      }
    } else {
      console.error(`Can't create prefab, avatar not found`);
    }
  },
};
