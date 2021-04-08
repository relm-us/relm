import {
  Component,
  StateComponent,
  RefType,
  StringType,
  BooleanType,
} from "~/ecs/base";

export class Particles extends Component {
  static props = {
    prefab: {
      type: StringType,
      editor: {
        label: "Prefab Name",
      },
    },
    follows: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Follows?",
      },
    },
  };

  static editor = {
    label: "Particles",
  };
}

export class ParticlesRef extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}

export class ParticlesLoading extends StateComponent {}
