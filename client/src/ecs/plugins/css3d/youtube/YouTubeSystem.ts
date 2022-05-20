import { Not, Modified } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { YouTube, YouTubeRef, CssPlane } from "../components";
import YouTubeComponent from "./YouTube.svelte";

import { RenderableBaseSystem } from "../RenderableBaseSystem";

export class YouTubeSystem extends RenderableBaseSystem {
  static queries: Queries = {
    added: [YouTube, Not(YouTubeRef)],
    modified: [Modified(YouTube), YouTubeRef],
    modifiedCssPlane: [Modified(CssPlane), YouTubeRef],
    active: [YouTube, YouTubeRef, Object3DRef],
    removed: [Not(YouTube), YouTubeRef],
  };

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;

    this.EcsComponent = YouTube;
    this.EcsComponentRef = YouTubeRef;
    this.RenderableComponent = YouTubeComponent;
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.modified.forEach((entity) => this.modify(entity));
    this.queries.modifiedCssPlane.forEach((entity) => this.rebuild(entity));
    this.queries.active.forEach((entity) => this.transform(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));
  }
}
