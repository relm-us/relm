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
    const id = ++loaderIds;

    entity.add(AssetLoading, { id });

    let value;
    try {
      value = await this.loadByKind(entity);
    } catch (err) {
      if (err.target) {
        if (err.target instanceof HTMLImageElement) {
          err = err.target.src;
        } else if (err.target instanceof XMLHttpRequest) {
          const t = err.target;
          err = `${t.responseURL} ${t.status} ${t.statusText}`;
        }
      }
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

  async loadByKind(entity) {
    const spec: Asset = entity.get(Asset);

    let url = spec.value.url;
    if (!url) return this.loadingError(entity, `missing url`);
    if (
      !url.startsWith("http") &&
      // Some assets such as humanoid-003.glb are loaded from our local server's
      // public folder, rather than the ourrelm asset server:
      !url.startsWith("/")
    ) {
      // relative URLs are assumed to be relative to our CDN asset server
      url = assetUrl(url);
    }

    switch (spec.kind) {
      case "TEXTURE":
        return await this.presentation.loadTexture(url);
      case "MODEL":
        return await this.presentation.loadGltf(url);
      default:
        throw Error("unknown asset kind");
    }
  }
}
