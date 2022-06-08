import {
  YComponent,
  YComponents,
  YEntities,
  YValues,
  getYDoc as ywsGetYDoc,
} from "relm-common";
import * as Y from "yjs";

import { Doc } from "./db/index.js";

export async function getYDoc(docId: string): Promise<Y.Doc> {
  const doc = await ywsGetYDoc(docId);
  await doc.whenSynced;
  return doc;
}

export const ydocStats = async (update, origin, doc: Y.Doc) => {
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
};

const empty = (val) => val === null || val === undefined || val === "";
