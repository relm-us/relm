import {
  Component,
  StateComponent,
  RefType,
  StringType,
  BooleanType,
} from "~/ecs/base";

export class Particles extends Component {
  prefab: string;
  follows: boolean;

  static props = {
    prefab: {
      type: StringType,
      editor: {
        label: "Prefab Name",
        input: "Select",
        options: [
          { label: "Blue Fire", value: "BLUEFIRE" },
          { label: "Teleport", value: "TELEPORT" },
        ],
      },
    },

    follows: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Follows entity?",
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
