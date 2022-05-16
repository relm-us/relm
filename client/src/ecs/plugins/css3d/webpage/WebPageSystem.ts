import { Not, Modified } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { WebPage, WebPageRef, CssPlane } from "../components";
import WebPageComponent from "./WebPage.svelte";

import { RenderableBaseSystem } from "../RenderableBaseSystem";

export class WebPageSystem extends RenderableBaseSystem {
  static queries: Queries = {
    added: [WebPage, Not(WebPageRef)],
    modified: [Modified(WebPage), WebPageRef],
    modifiedCssPlane: [Modified(CssPlane), WebPageRef],
    active: [WebPage, WebPageRef, Object3DRef],
    removed: [Not(WebPage), WebPageRef],
  };

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;

    this.EcsComponent = WebPage;
    this.EcsComponentRef = WebPageRef;
    this.RenderableComponent = WebPageComponent;
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.modified.forEach((entity) => this.modify(entity));
    this.queries.modifiedCssPlane.forEach((entity) => this.rebuild(entity));
    this.queries.active.forEach((entity) => this.transform(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));
  }
}
