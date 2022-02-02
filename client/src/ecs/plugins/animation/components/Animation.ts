import { Component, NumberType, StringType, BooleanType } from "~/ecs/base";

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

  maybeChangeClip(newClip: string | { clipName: string; loop: boolean }) {
    let clipName;
    let loop;
    if (typeof newClip === "object") {
      clipName = newClip.clipName;
      loop = newClip.loop;
    } else {
      clipName = newClip;
      loop = true;
    }
    if (this.clipName !== clipName) {
      this.clipName = clipName;
      this.loop = loop;
      this.modified();
    }
  }
}
