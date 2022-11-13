import { System, Groups } from "~/ecs/base";

import { Presentation } from "~/ecs/plugins/core";
import { assetUrl } from "~/config/assetUrl";
import { checkModelValid } from "../utils/checkModelValid";

let loaderIds = 0;

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("asset");

export class AssetSystemBase extends System {
  presentation: Presentation;
  AssetComponent: any;
  AssetLoadingComponent: any;
  AssetLoadedComponent: any;
  urlField: string = "url";
  kindField: string = "kind";

  order = Groups.Initialization;

  init({ presentation }) {
    this.presentation = presentation;
  }

  async load(entity) {
    const spec = entity.get(this.AssetComponent);

    if (spec[this.urlField] === "") {
      this.loadingError(entity, "url is blank");
      return;
    }

    const id = ++loaderIds;

    entity.add(this.AssetLoadingComponent, { id });

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

    const loadingId = entity.get(this.AssetLoadingComponent).id;

    if (loadingId === id) {
      entity.remove(this.AssetLoadingComponent);
      entity.add(this.AssetLoadedComponent, {
        kind: spec[this.kindField],
        cacheKey: spec[this.urlField],
        value,
      });
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
    entity.add(this.AssetLoadedComponent, { error: msg });
    if (msg) console.warn(`AssetSystem: ${msg}`, entity?.id);
  }

  remove(entity) {
    entity.maybeRemove(this.AssetLoadingComponent);
    entity.maybeRemove(this.AssetLoadedComponent);
  }

  async loadByKind(entity) {
    const spec = entity.get(this.AssetComponent);

    let url = spec[this.urlField];
    if (
      !url.startsWith("http") &&
      // Some assets such as humanoid-003.glb are loaded from our local server's
      // public folder, rather than the ourrelm asset server:
      !url.startsWith("/")
    ) {
      // relative URLs are assumed to be relative to our CDN asset server
      url = assetUrl(url);
    }

    switch (spec[this.kindField]) {
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
