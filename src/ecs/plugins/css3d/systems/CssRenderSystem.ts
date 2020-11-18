import { System, Groups } from "hecs";
import { PerspectiveCamera, Vector3 } from "three";
import { isBrowser } from "~/utils/isBrowser";

const FACTOR = 1;

export class CssRenderSystem extends System {
  active = isBrowser();
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

    this.cssPresentation.updateCamera();
    this.cssPresentation.render();
  }
}
