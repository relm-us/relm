import { Component, StringType } from "~/ecs/base"

export class AudioZone extends Component {
  zone: string

  static props = {
    zone: {
      type: StringType,
      default: "zone-1",
      editor: {
        label: "Zone Name",
      },
    },
  }

  static editor = {
    label: "Audio Zone",
  }
}
