import { World } from "~/ecs/base";
import { WorldDoc } from "~/y-integration/WorldDoc";

function removeLocalServerUrlPrefixes(entity) {
  let component;
  let modified = false;
  const prefixesToRemove = [
    "http://localhost:3000/asset/",
    "https://y-staging.relm.us/asset/",
    "https://y-prod.relm.us/asset/",
  ];

  console.log("entity", entity);

  component = entity.getByName("Shape");
  if (component) {
    for (const prefix of prefixesToRemove) {
      if (component.texture.url.startsWith(prefix)) {
        component.texture.url = component.texture.url.replace(prefix, "");
        component.modified();
        modified = true;
      }
    }
  }

  component = entity.getByName("Model");
  if (component) {
    for (const prefix of prefixesToRemove) {
      if (component.asset.url.startsWith(prefix)) {
        component.asset.url = component.asset.url.replace(prefix, "");
        component.modified();
        modified = true;
      }
    }
  }

  component = entity.getByName("Asset");
  if (component) {
    for (const prefix of prefixesToRemove) {
      if (component.model.url.startsWith(prefix)) {
        component.model.url = component.model.url.replace(prefix, "");
        component.modified();
        modified = true;
      }
      if (component.texture.url.startsWith(prefix)) {
        component.texture.url = component.texture.url.replace(prefix, "");
        component.modified();
        modified = true;
      }
    }
  }

  return modified;
}

export function migrateToCDN(world: World, wdoc: WorldDoc) {
  let modifiedCount = 0;
  for (const entity of world.entities.entities.values()) {
    const modified = removeLocalServerUrlPrefixes(entity);
    if (modified) {
      wdoc.syncFrom(entity);
      modifiedCount++;
    }
  }
  return modifiedCount;
}
