import { Mesh } from "three";
import { LocalComponent } from "~/ecs/base";

export class ItemActor extends LocalComponent {
  // Optional sphere helper shows bounds where items are considered "nearby"
  sphereHelper: Mesh;

  static props = {};
}
