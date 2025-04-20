import { Not, Modified, type Entity } from "~/ecs/base"

import type { Queries } from "~/ecs/base/Query"
import { AssetSystemBase } from "~/ecs/plugins/asset/systems/AssetSystemBase"

import { checkModelValid } from "../utils/checkModelValid"
import { Model3, ModelAssetLoading, ModelAssetLoaded } from "../components"

export class ModelAssetSystem extends AssetSystemBase {
  static queries: Queries = {
    added: [Model3, Not(ModelAssetLoading), Not(ModelAssetLoaded)],
    modified: [Modified(Model3), ModelAssetLoaded],
    removed: [Not(Model3), ModelAssetLoaded],
  }

  init({ presentation }) {
    this.presentation = presentation

    this.AssetComponent = Model3
    this.AssetLoadingComponent = ModelAssetLoading
    this.AssetLoadedComponent = ModelAssetLoaded
    this.assetField = "asset"
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.load(entity)
    })

    this.queries.modified.forEach((entity) => {
      const spec: Model3 = entity.get(Model3)
      const loaded: ModelAssetLoaded = entity.get(ModelAssetLoaded)

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
    if (/\.(glb|gltf)$/.test(url)) {
      const gltf = await this.presentation.loadGltf(url)
      const valid = checkModelValid(gltf.scene)
      if (valid.type === "ok") return gltf
      else throw Error(`invalid glTF: ${valid.reason}`)
    } else {
      throw Error(`ModelAsset requires a glb or gltf file (${entity.id})`)
    }
  }
}
