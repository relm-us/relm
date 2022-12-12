import { System, Groups, Entity } from "~/ecs/base";

import { Presentation } from "~/ecs/plugins/core";
import { assetUrl } from "~/config/assetUrl";

let loaderIds = 0;

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("asset");

export class AssetSystemBase extends System {
  presentation: Presentation;
  AssetComponent: any;
  AssetLoadingComponent: any;
  AssetLoadedComponent: any;
  assetField: string = "asset";

  order = Groups.Initialization;

  init({ presentation }) {
    this.presentation = presentation;
  }

  async load(entity: Entity) {
    const spec = entity.get(this.AssetComponent);

    if (this.getUrl(spec) === "") {
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
        cacheKey: this.getUrl(spec),
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
    return await this.loadAsset(entity, this.getUrl(spec));
  }

  getUrl(spec): string {
    const field = spec[this.assetField];
    let url = (field?.url || "").toLowerCase();

    if (
      // Respect absolute URLS starting with `http` or `https`
      !url.startsWith("http") &&
      // Respect absolute paths starting with `/` that access local public folder
      !url.startsWith("/")
    ) {
      // relative URLs are assumed to be relative to either the CDN asset server,
      // or the expressjs relm-server, depending on configuration
      return assetUrl(url);
    } else {
      return url;
    }
  }

  async loadAsset(entity: Entity, url: string): Promise<any> {
    throw Error("requires subclass implementation");
  }
}
