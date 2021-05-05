import { System, Not, Modified, Groups } from "~/ecs/base";

import { Asset, AssetLoading, AssetLoaded } from "../components";
import { Presentation } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

let loaderIds = 0;

export class AssetSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries: Queries = {
    added: [Asset, Not(AssetLoading), Not(AssetLoaded)],
    modified: [Modified(Asset), Not(AssetLoading), Not(AssetLoaded)],
    removed: [Not(Asset), AssetLoaded],
    removedWhileLoading: [Not(Asset), AssetLoading],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.load(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.load(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.cleanup(entity);
    });
    this.queries.removedWhileLoading.forEach((entity) => {
      this.cleanup(entity);
    });
  }

  async load(entity) {
    const type = this.getAssetType(entity);
    if (!type) return this.loadingError(entity, "invalid type");

    const url = entity.get(Asset)[type].url;
    if (!url) return this.loadingError(entity, `missing url ('${type}')`);

    const id = ++loaderIds;
    entity.add(AssetLoading, { id });

    let value;
    try {
      if (type === "texture") value = await this.presentation.loadTexture(url);
      else if (type === "model") value = await this.presentation.loadGltf(url);
    } catch (err) {
      return this.loadingError(entity, `unable to load asset: "${err}"`);
    }

    const loadingId = entity.get(AssetLoading).id;
    entity.remove(AssetLoading);

    if (loadingId === id) {
      entity.add(AssetLoaded, { value });
    } else {
      return this.loadingError(entity, `${id} was cancelled`);
    }
  }

  loadingError(entity, msg) {
    this.cleanup(entity);
    console.warn(`AssetSystem: ${msg}`, entity);
  }

  cleanup(entity) {
    entity.maybeRemove(Asset);
    entity.maybeRemove(AssetLoading);
    entity.maybeRemove(AssetLoaded);
  }

  getAssetType(entity) {
    const asset = entity.get(Asset);
    if (asset.texture?.url) return "texture";
    if (asset.model?.url) return "model";
  }
}
