import * as Y from "yjs";

import { YComponent, YComponents, YEntities, YValues } from "relm-common";

import { empty } from "./utils/empty.js";
import { Doc } from "./db/index.js";

export const ydocStats = async (update, origin, doc: Y.Doc) => {
  if (!doc) {
    // can be null if it was deleted
    console.log("Skipping stats for deleted doc");
    return;
  }

  const entities: YEntities = doc.getArray("entities");

  let assetsCount = 0;
  entities.forEach((entity) => {
    const components = (entity.get("components") as YComponents).toArray();
    if (
      components.some((component: YComponent) => {
        const name = component.get("name");
        const values: YValues = component.get("values") as YValues;
        return (
          (name === "Model" && !empty((values.get("asset") as any)?.url)) ||
          (name === "Image" && !empty((values.get("asset") as any)?.url)) ||
          (name === "Shape" && !empty((values.get("texture") as any)?.url)) ||
          (name === "Skybox" && !empty((values.get("image") as any)?.url))
        );
      })
    ) {
      assetsCount++;
    }
  });

  const entitiesCount = entities.length;

  const docId: string = (doc as any).name;
  const docBefore = await Doc.getDocWithRelmName({ docId });
  console.log(
    `Storing stats for '${docBefore.relmName}':\n` +
      `  entities: ${entitiesCount} (was ${docBefore.entitiesCount})\n` +
      `  assets: ${assetsCount} (was ${docBefore.assetsCount})`
  );

  await Doc.updateStats({
    docId,
    entitiesCount,
    assetsCount,
  });

  console.log("updated stats");
};
