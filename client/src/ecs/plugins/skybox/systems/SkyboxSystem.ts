import { Presentation } from "~/ecs/plugins/core";
import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import { Skybox, SkyboxRef } from "../components";

export class SkyboxSystem extends System {
  order = Groups.Simulation + 1;

  presentation: Presentation;

  static queries = {
    new: [Skybox, Not(SkyboxRef)],
    active: [Skybox, SkyboxRef],
    modified: [Modified(Skybox), SkyboxRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.load(entity);
    });

    this.queries.active.forEach((entity) => {
      this.resize(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.load(entity);
    });
  }

  load(entity: Entity) {
    if (!entity.has(SkyboxRef)) entity.add(SkyboxRef);

    const asset = entity.get(Skybox).image;
    this.presentation.loadTexture(asset.url).then((texture) => {
      entity.get(SkyboxRef).texture = texture;
    });
  }

  resize(entity) {
    const ref = entity.get(SkyboxRef);

    // Must have a texture to resize
    if (!ref.texture) return;

    // Optimization: Skip resize if window is same size as last time
    if (window.innerWidth === ref.width && window.innerHeight === ref.height)
      return;

    ref.width = window.innerWidth;
    ref.height = window.innerHeight;

    this.presentation.scene.background = ref.texture;

    const canvasAspect = ref.width / ref.height;
    const imageAspect = ref.texture.image.width / ref.texture.image.height;
    const aspect = imageAspect / canvasAspect;

    ref.texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    ref.texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    ref.texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    ref.texture.repeat.y = aspect > 1 ? 1 : aspect;
  }
}
