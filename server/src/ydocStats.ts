import type { WSSharedDoc, YComponents, YEntities, YValues } from "relm-common"

import { empty } from "./utils/empty.js"
import { Doc } from "./db/index.js"

export const ydocStats = async (ydoc: WSSharedDoc) => {
  if (!ydoc) {
    // can be null if it was deleted
    console.log("skipping stats for deleted ydoc")
    return
  }

  const docId: string = ydoc.name
  const relmDoc = await Doc.getDocWithRelmName({ docId })

  if (!relmDoc) {
    console.warn(`db has no doc with id '${docId}'`)
    return
  }

  const relmName = relmDoc.relmName

  const entities: YEntities = ydoc.getArray("entities")

  const portals = []

  let assetsCount = 0
  entities.forEach((entity) => {
    for (let component of entity.get("components") as YComponents) {
      const name = component.get("name")
      const values: YValues = component.get("values") as YValues

      if (
        // Don't count HdImage assets, because they lazy-load on their own
        // (name === "HdImage" && !empty((values.get("asset") as any)?.url)) ||
        (name === "Model" && !empty((values.get("asset") as any)?.url)) ||
        (name === "Image" && !empty((values.get("asset") as any)?.url)) ||
        (name === "Shape" && !empty((values.get("texture") as any)?.url)) ||
        (name === "Skybox" && !empty((values.get("image") as any)?.url)) ||
        (name === "Shape3" && !empty((values.get("asset") as any)?.url)) ||
        (name === "Model3" && !empty((values.get("asset") as any)?.url))
      ) {
        assetsCount++
      }

      if (name === "Portal" && values.get("kind") === "REMOTE") {
        const portal = values.get("relm")
        if (typeof portal === "string") {
          portals.push(portal)
        } else {
          console.warn(`remote portal for '${relmName}' has wrong type: '${typeof portal}' (${portal})`)
        }
      }
    }
  })

  console.log(
    `Storing stats for '${relmName}':\n` +
      `  entities: ${entities.length} (was ${relmDoc.entitiesCount})\n` +
      `    assets: ${assetsCount} (was ${relmDoc.assetsCount})\n` +
      `   portals: ${JSON.stringify(portals)}`,
  )

  // Update DB-cached relmDoc stats
  await Doc.updateStats({
    docId,
    entitiesCount: entities.length,
    assetsCount,
    portals,
  })
}
