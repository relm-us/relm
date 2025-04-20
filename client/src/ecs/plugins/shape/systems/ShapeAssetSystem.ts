import { Not, Modified, type Entity } from "~/ecs/base"

import type { Queries } from "~/ecs/base/Query"
import { AssetSystemBase } from "~/ecs/plugins/asset/systems/AssetSystemBase"

import { Shape3, ShapeAssetLoading, ShapeAssetLoaded } from "../components"

export class ShapeAssetSystem extends AssetSystemBase {
  static queries: Queries = {
    added: [Shape3, Not(ShapeAssetLoading), Not(ShapeAssetLoaded)],
    modified: [Modified(Shape3), ShapeAssetLoaded],
    removed: [Not(Shape3), ShapeAssetLoaded],
  }

  init({ presentation }) {
    this.presentation = presentation

    this.AssetComponent = Shape3
    this.AssetLoadingComponent = ShapeAssetLoading
    this.AssetLoadedComponent = ShapeAssetLoaded
    this.assetField = "asset"
  }

  update() {
    this.queries.added.forEach((entity) => {
      const spec: Shape3 = entity.get(Shape3)
      if (spec.asset && spec.asset.url !== "") this.load(entity)
    })

    this.queries.modified.forEach((entity) => {
      const spec: Shape3 = entity.get(Shape3)
      const loaded: ShapeAssetLoaded = entity.get(ShapeAssetLoaded)

      if (loaded.cacheKey !== this.getUrl(spec)) {
        this.remove(entity)
        this.load(entity)

        spec.needsRebuild = true
      }
    })

    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  async loadAsset(entity: Entity, url: string) {
    if (/\.(png|jpg|jpeg|webp)$/.test(url)) {
      return await this.presentation.loadTexture(url)
    } else {
      throw Error(`ShapeAsset requires an image file for its texture (${entity.id})`)
    }
  }
}
