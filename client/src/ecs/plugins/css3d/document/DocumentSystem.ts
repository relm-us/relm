import { Not, Modified, Entity } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { Document, DocumentRef, CssPlane, HdImage } from "../components";
import { RenderableBaseSystem } from "../base/RenderableBaseSystem";

import DocumentComponent from "./Document.svelte";

export class DocumentSystem extends RenderableBaseSystem {
  static queries: Queries = {
    /**
     * Q: Why Not(HdImage)?
     *
     * A: When an HdImage is also available, we always present the HdImage
     *    as the thing inside a CssPlane to be clicked and manipulated in
     *    the 3D world. It behaves as the "book cover" for the Document.
     *
     *    If we also add a Document CssPlane, there can be pointer event
     *    masking, where the user can't click to open the HdImage.
     */
    added: [Document, Not(DocumentRef), Not(HdImage)],
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
