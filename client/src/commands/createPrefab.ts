import { WorldTransform } from "~/ecs/plugins/core";
import { directory } from "~/prefab";
import { assetUrl } from "~/stores/config";

function activate($Relm, entity) {
  entity.activate();
  $Relm.wdoc.syncFrom(entity);
  for (const child of entity.getChildren()) {
    activate($Relm, child);
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
  command: ($Relm, { name, src }, props) => {
    const transform = $Relm.avatar?.get(WorldTransform);
    if (transform) {
      const x = transform.position.x;
      const z = transform.position.z;

      const prefab = directory.find((item) => item.name === name);
      if (prefab) {
        const url = assetUrl(src);
        let entities = prefab.prefab($Relm.world, {
          ...props,
          x,
          z,
          url,
        });
        if (!(entities instanceof Array)) entities = [entities];

        for (const entity of entities) {
          activate($Relm, entity);
        }
      } else {
        console.error(`Prefab not found: '${name}'`);
      }
    } else {
      console.error(`Can't create prefab, avatar not found`);
    }
  },
};
