import { Component, JSONType } from "~/ecs/base";

export type TransformEffectSpec = {
  function: string;
  params: object;
};

export class TransformEffects extends Component {
  effects: Array<TransformEffectSpec>;

  static props = {
    effects: {
      type: JSONType,
      default: {},
      editor: {
        label: "Effects",
      },
    },
  };

  static editor = {
    label: "TransformEffects",
  };
}
