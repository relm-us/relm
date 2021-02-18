import { System, Groups, Not } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { NetworkControl } from "../components";

export class NetworkControlSystem extends System {
  order = Groups.Presentation + 310;

  static queries = {
    active: [NetworkControl],
  };

  update() {
    this.queries.active.forEach((entity) => {});
  }
}
