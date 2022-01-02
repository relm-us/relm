import { Component, StringType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Portal extends Component {
  kind: "LOCAL" | "REMOTE";
  coords: Vector3;
  entry: string;
  relm: string;

  static props = {
    kind: {
      type: StringType,
      default: "LOCAL",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Local", value: "LOCAL" },
          { label: "Remote", value: "REMOTE" },
        ],
      },
    },

    coords: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Coordinates",
        requires: [{ prop: "kind", value: "LOCAL" }],
      },
    },

    entryway: {
      type: StringType,
      default: "default",
      editor: {
        label: "Entry Name",
        requires: [{ prop: "kind", value: "REMOTE" }],
      },
    },

    relm: {
      type: StringType,
      editor: {
        label: "Relm Name",
        requires: [{ prop: "kind", value: "REMOTE" }],
      },
    },
  };

  static editor = {
    label: "Portal",
  };
}
