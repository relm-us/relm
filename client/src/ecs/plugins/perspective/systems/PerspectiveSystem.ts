import { System } from "~/ecs/base";
import { Perspective } from "../Perspective";

export class PerspectiveSystem extends System {
  perspective: Perspective;

  init({ perspective }) {
    this.perspective = perspective;
  }

  update() {
    this.perspective.update();
  }
}
