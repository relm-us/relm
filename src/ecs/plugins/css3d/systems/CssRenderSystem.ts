import { System, Groups } from "hecs";
import { IS_BROWSER } from "../utils";

export class CssRenderSystem extends System {
  active = IS_BROWSER;
  order = Groups.Presentation + 100;

  init({ presentation, cssPresentation }) {
    if (!presentation) {
      throw new Error(
        "hecs-plugin-css3d must be loaded after hecs-plugin-three"
      );
    }
    this.presentation = presentation;
    this.cssPresentation = cssPresentation;
  }

  update() {
    if (!this.cssPresentation.viewport || !this.presentation.viewport) return;
    // Using the CSS3DRenderer, render the hecs-plugin-three scene using the
    // hecs-plugin-three camera
    this.cssPresentation.renderer.render(
      this.presentation.scene,
      this.presentation.camera
    );
  }
}
