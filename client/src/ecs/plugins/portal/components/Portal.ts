import { Component, StringType } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Portal extends Component {
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

    entry: {
      type: StringType,
      editor: {
        label: "Entry Name",
        requires: [{ prop: "kind", value: "REMOTE" }],
      },
    },

    subrelm: {
      type: StringType,
      default: "relm",
      editor: {
        label: "Subrelm Name",
        requires: [{ prop: "kind", value: "REMOTE" }],
      },
    },
  };

  static editor = {
    label: "Portal",
  };
}
