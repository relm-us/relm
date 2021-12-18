import { System, Not, Modified, Groups } from "~/ecs/base";

import { Asset, AssetLoading, AssetLoaded, AssetError } from "../components";
import { Presentation } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";
import { assetUrl } from "~/config/assetUrl";

let loaderIds = 0;

export class AssetSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries: Queries = {
    added: [Asset, Not(AssetLoading), Not(AssetLoaded), Not(AssetError)],
    modified: [Modified(Asset)],
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
      this.remove(entity);
      this.load(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.removedWhileLoading.forEach((entity) => {
      this.remove(entity);
    });
  }

  async load(entity) {
    const type = this.getAssetType(entity);
    if (!type) return this.loadingError(entity, "invalid type");

    let url = entity.get(Asset)[type].url;
    if (!url) return this.loadingError(entity, `missing url ('${type}')`);
    if (!url.startsWith("http") &&
        // Some assets such as humanoid-003.glb are loaded from our local server's
        // public folder, rather than the ourrelm asset server:
        !url.startsWith("/")) {
      // relative URLs are assumed to be relative to our CDN asset server
      url = assetUrl(url);
    }

    const id = ++loaderIds;
    entity.add(AssetLoading, { id });

    let value;
    try {
      if (type === "texture") value = await this.presentation.loadTexture(url);
      else if (type === "model") value = await this.presentation.loadGltf(url);
    } catch (err) {
      // TODO: when load fails with 404, say the asset can't be found rather than
      // "SyntaxError: JSON.parse: unexpected character at line 1"
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
    this.remove(entity);
    entity.add(AssetError, { error: msg });
    console.warn(`AssetSystem: ${msg}`, entity);
  }

  remove(entity) {
    entity.maybeRemove(AssetLoading);
    entity.maybeRemove(AssetLoaded);
    entity.maybeRemove(AssetError);
  }

  getAssetType(entity) {
    const asset = entity.get(Asset);
    if (asset.texture && asset.texture.url !== "") return "texture";
    if (asset.model && asset.model.url !== "") return "model";
  }
}
