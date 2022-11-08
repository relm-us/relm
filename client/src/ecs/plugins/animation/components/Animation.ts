import { Component, NumberType, StringType, BooleanType } from "~/ecs/base";

// For humanoid animation clip names see `src/config/constants.ts`
// For all other clip names, see individual GLB assets.
export class Animation extends Component {
  clipName: string;
  transition: number;
  timeScale: number;
  loop: boolean;

  static props = {
    clipName: {
      type: StringType,
      default: null,
      editor: {
        label: "Clip Name",
        // This is a very specific input type designed just for this Component
        input: "AnimationSelect",
      },
    },

    transition: {
      type: NumberType,
      default: 0.2,
      editor: {
        label: "Transition Time",
      },
    },

    timeScale: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Time Scale",
      },
    },

    loop: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Endless Loop",
      },
    },
  };

  static editor = {
    label: "Animation",
  };

  maybeChangeClip(clipName: string, loop: boolean = false) {
    if (this.clipName !== clipName) {
      this.clipName = clipName;
      this.loop = loop;
      this.modified();
    }
  }
}
