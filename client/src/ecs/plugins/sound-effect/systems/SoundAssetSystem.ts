import { Not, Modified } from "~/ecs/base";

import { Queries } from "~/ecs/base/Query";
import { AssetSystemBase } from "~/ecs/plugins/asset/systems/AssetSystemBase";

import {
  SoundEffect,
  SoundAssetLoading,
  SoundAssetLoaded,
} from "../components";

export class SoundAssetSystem extends AssetSystemBase {
  static queries: Queries = {
    added: [SoundEffect, Not(SoundAssetLoading), Not(SoundAssetLoaded)],
    modified: [Modified(SoundEffect), SoundAssetLoaded],
    removed: [Not(SoundEffect), SoundAssetLoaded],
  };

  init({ presentation }) {
    this.presentation = presentation;

    this.AssetComponent = SoundEffect;
    this.AssetLoadingComponent = SoundAssetLoading;
    this.AssetLoadedComponent = SoundAssetLoaded;
    this.assetField = "asset";
  }

  update() {
    this.queries.added.forEach((entity) => {
      const spec: SoundEffect = entity.get(SoundEffect);
      if (spec.asset && spec.asset.url !== "") this.load(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.load(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }
}
