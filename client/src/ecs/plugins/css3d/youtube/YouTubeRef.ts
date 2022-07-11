import { LocalComponent, RefType } from "~/ecs/base";

export class YouTubeRef extends LocalComponent {
  value: any;

  static props = {
    value: {
      type: RefType,
    },
  };
}
