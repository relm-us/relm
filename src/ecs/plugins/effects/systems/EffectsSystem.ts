import { System, Groups, Not, Modified } from "hecs";

export class EffectsSystem extends System {
  order = Groups.Presentation + 1000;

  init({ effects }) {
    this.effects = effects;
  }

  update() {
    this.effects.composer.render();
  }
}
