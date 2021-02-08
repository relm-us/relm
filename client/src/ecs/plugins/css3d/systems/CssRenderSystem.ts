import { System, Groups } from "~/ecs/base";
import { PerspectiveCamera, Vector3 } from "three";
import { isBrowser } from "~/utils/isBrowser";
import { Presentation } from "~/ecs/plugins/three/Presentation";
import { CssPresentation } from "../CssPresentation";

const FACTOR = 1;

export class CssRenderSystem extends System {
  presentation: Presentation;
  cssPresentation: CssPresentation;
  frame: number;

  active = isBrowser();
  order = Groups.Presentation + 100;

  init({ presentation, cssPresentation }) {
    if (!presentation) {
      throw new Error("ECS: plugin/css3d must be loaded after plugin/three");
    }
    this.presentation = presentation;
    this.cssPresentation = cssPresentation;

    this.frame = 0;
  }

  update() {
    if (!this.cssPresentation.viewport || !this.presentation.viewport) return;

    // Possible optimization for slow CPUs: skip every second frame
    // if (this.frame++ % 2 === 0) {
    this.cssPresentation.updateCamera();
    this.cssPresentation.render();
    // }
  }
}
