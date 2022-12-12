import { Not, Modified, Entity } from "~/ecs/base";

import { Queries } from "~/ecs/base/Query";
import { AssetSystemBase } from "~/ecs/plugins/asset/systems/AssetSystemBase";

import { Image, ImageAssetLoading, ImageAssetLoaded } from "../components";

export class ImageAssetSystem extends AssetSystemBase {
  static queries: Queries = {
    added: [Image, Not(ImageAssetLoading), Not(ImageAssetLoaded)],
    modified: [Modified(Image), ImageAssetLoaded],
    removed: [Not(Image), ImageAssetLoaded],
  };

  init({ presentation }) {
    this.presentation = presentation;

    this.AssetComponent = Image;
    this.AssetLoadingComponent = ImageAssetLoading;
    this.AssetLoadedComponent = ImageAssetLoaded;
    this.assetField = "asset";
  }

  update() {
    this.queries.added.forEach((entity) => {
      const spec: Image = entity.get(Image);
      if (spec.asset && spec.asset.url !== "") this.load(entity);
    });

    this.queries.modified.forEach((entity) => {
      const spec: Image = entity.get(Image);
      const loaded: ImageAssetLoaded = entity.get(ImageAssetLoaded);

      if (loaded.cacheKey !== this.getUrl(spec)) {
        this.remove(entity);
        this.load(entity);

        spec.needsRebuild = true;
      }
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  async loadAsset(entity: Entity, url: string) {
    if (/\.(png|jpg|jpeg|webp)$/.test(url)) {
      return await this.presentation.loadTexture(url);
    } else {
      throw Error(
        `ImageAsset requires an image file for its texture (${entity.id})`
      );
    }
  }
}
