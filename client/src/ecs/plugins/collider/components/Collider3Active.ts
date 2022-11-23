import { Component } from "~/ecs/base/Component";
import { Collider3 } from "./Collider3";

export class Collider3Active extends Component {
  static activator = Collider3;
}
