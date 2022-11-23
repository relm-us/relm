import { Component } from "~/ecs/base";

import { Particles2 } from "./Particles2";

export class ParticlesActive extends Component {
  static activator = Particles2;
}
