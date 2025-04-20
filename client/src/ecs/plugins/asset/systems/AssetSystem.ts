import { Not, Modified } from "~/ecs/base"

import { Asset, AssetLoading, AssetLoaded } from "../components"
import type { Queries } from "~/ecs/base/Query"
import { AssetSystemBase } from "./AssetSystemBase"

export class AssetSystem extends AssetSystemBase {
  static queries: Queries = {
    added: [Asset, Not(AssetLoading), Not(AssetLoaded)],
    modified: [Modified(Asset)],
    removed: [Not(Asset), AssetLoaded],
  }

  init({ presentation }) {
    this.presentation = presentation

    this.AssetComponent = Asset
    this.AssetLoadingComponent = AssetLoading
    this.AssetLoadedComponent = AssetLoaded
    this.assetField = "value"
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.load(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.load(entity)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }
}
