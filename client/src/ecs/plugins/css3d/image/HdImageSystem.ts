import { Not, Modified } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { CssPlane } from "../components";
import { HdImage } from "./HdImage";
import { HdImageRef } from "./HdImageRef";
import HdImageComponent from "./HdImage.svelte";

import { RenderableBaseSystem } from "../RenderableBaseSystem";

export class HdImageSystem extends RenderableBaseSystem {
  static queries: Queries = {
    added: [HdImage, Not(HdImageRef)],
    modified: [Modified(HdImage), HdImageRef],
    modifiedCssPlane: [Modified(CssPlane), HdImageRef],
    active: [HdImage, HdImageRef, Object3DRef],
    removed: [Not(HdImage), HdImageRef],
  };

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;

    this.EcsComponent = HdImage;
    this.EcsComponentRef = HdImageRef;
    this.RenderableComponent = HdImageComponent;
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.modified.forEach((entity) => this.modify(entity));
    this.queries.modifiedCssPlane.forEach((entity) => this.rebuild(entity));
    this.queries.active.forEach((entity) => this.transform(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));
  }
}
