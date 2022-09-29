import { System, Not, Modified, Groups } from "~/ecs/base";

import { Asset, AssetLoading, AssetLoaded } from "../components";
import { Presentation } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";
import { assetUrl } from "~/config/assetUrl";
import { checkModelValid } from "../utils/checkModelValid";

let loaderIds = 0;

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("asset");

export class AssetSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries: Queries = {
    added: [Asset, Not(AssetLoading), Not(AssetLoaded)],
    modified: [Modified(Asset)],
    removed: [Not(Asset), AssetLoaded],
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
  }

  async load(entity) {
    const spec: Asset = entity.get(Asset);

    if (spec.url === "") {
      this.loadingError(entity, "url is blank");
      return;
    }

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

    if (!value) {
      console.warn("nothing loaded", entity.id);
    }

    const loadingId = entity.get(AssetLoading).id;

    if (loadingId === id) {
      entity.remove(AssetLoading);
      entity.add(AssetLoaded, { kind: spec.kind, cacheKey: spec.url, value });
    } else {
      this.loadingError(
        entity,
        logEnabled && `${id} was cancelled (!= ${loadingId})`,
        false
      );
    }
  }

  loadingError(entity, msg, remove = true) {
    if (remove) this.remove(entity);
    entity.add(AssetLoaded, { error: msg });
    if (msg) console.warn(`AssetSystem: ${msg}`, entity?.id);
  }

  remove(entity) {
    entity.maybeRemove(AssetLoading);
    entity.maybeRemove(AssetLoaded);
  }

  async loadByKind(entity) {
    const spec: Asset = entity.get(Asset);

    let url = spec.url;
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
      case "GLTF":
        const gltf = await this.presentation.loadGltf(url);
        const valid = checkModelValid(gltf.scene);
        if (valid.type === "ok") return gltf;
        else throw Error(`invalid glTF: ${valid.reason}`);
      default:
        throw Error("unknown asset kind");
    }
  }
}
