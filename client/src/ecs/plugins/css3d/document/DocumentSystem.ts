import { Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { Document, DocumentRef, CssPlane } from "../components";
import { RenderableBaseSystem } from "../base/RenderableBaseSystem";

import DocumentComponent from "./Document.svelte";

export class DocumentSystem extends RenderableBaseSystem {
  static queries: Queries = {
    added: [Document, Not(DocumentRef)],
    modified: [Modified(Document), DocumentRef],
    modifiedCssPlane: [Modified(CssPlane), DocumentRef],
    active: [Document, DocumentRef, Object3DRef],
    removed: [Not(Document), DocumentRef],
  };

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;

    this.EcsComponent = Document;
    this.EcsComponentRef = DocumentRef;
    this.RenderableComponent = DocumentComponent;
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.modified.forEach((entity) => this.modify(entity));
    this.queries.modifiedCssPlane.forEach((entity) => this.rebuild(entity));
    this.queries.active.forEach((entity) => this.transform(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));
  }
}
