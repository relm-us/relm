import { LocalComponent, StringType } from "~/ecs/base";

export class AudioZoneEntered extends LocalComponent {
  zone: string;

  static props = {
    zone: {
      type: StringType,
    },
  };
}
