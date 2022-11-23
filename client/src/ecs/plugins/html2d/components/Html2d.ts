import {
  BooleanType,
  Component,
  NumberType,
  RefType,
  StringType,
} from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Html2d extends Component {
  kind: "INFO" | "LABEL" | "SPEECH" | "EMOJI" | "OCCUPANCY";
  offset: Vector3;
  width: number;
  vanchor: 0 | 1 | 2;
  hanchor: 0 | 1 | 2;
  color: string;
  shadowColor: string;
  underlineColor: string;
  title: string;
  link: string;
  content: string;
  editable: boolean;
  visible: boolean;
  zoomInvariant: boolean;
  zoomSize: number;
  onChange: Function;
  onClose: Function;

  static props = {
    kind: {
      type: StringType,
      default: "INFO",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Info", value: "INFO" },
          { label: "Label", value: "LABEL" },
          { label: "Speech", value: "SPEECH" },
          { label: "Portal Occupancy", value: "OCCUPANCY" },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Position Offset",
      },
    },

    vanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Vertical)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Top", value: 1 },
          { label: "Bottom", value: 2 },
        ],
      },
    },

    hanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Horz.)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Left", value: 1 },
          { label: "Right", value: 2 },
        ],
      },
    },

    color: {
      type: StringType,
      default: "#FFFFFF",
      editor: {
        label: "Text Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    shadowColor: {
      type: StringType,
      default: "#000000",
      editor: {
        label: "Shadow Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    underlineColor: {
      type: StringType,
      default: null,
      editor: {
        label: "Underline Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    title: {
      type: StringType,
      default: null,
      editor: {
        label: "Title",
        requires: [
          { prop: "kind", value: "INFO" },
          { prop: "kind", value: "OCCUPANCY" },
        ],
      },
    },

    link: {
      type: StringType,
      default: null,
      editor: {
        label: "Title Link (URL)",
        requires: [{ prop: "kind", value: "INFO" }],
      },
    },

    content: {
      type: StringType,
      default: null,
      editor: {
        label: "HTML Content",
        requires: [
          { prop: "kind", value: "INFO" },
          { prop: "kind", value: "LABEL" },
          { prop: "kind", value: "SPEECH" },
        ],
      },
    },

    editable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Editable",
        requires: [{ prop: "kind", value: "INFO" }],
      },
    },

    visible: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Visible",
      },
    },

    zoomInvariant: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Zoom Invariant",
      },
    },

    zoomSize: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Zoom Size",
        increment: 0.01,
        min: 0.1,
        max: 5,
        requires: [{ prop: "zoomInvariant", value: false }],
      },
    },

    // Called when done editing
    onChange: {
      type: RefType,
      editor: {
        // hide
        requires: [{ prop: "kind", value: "" }],
      },
    },

    onClose: {
      type: RefType,
      editor: {
        // hide
        requires: [{ prop: "kind", value: "" }],
      },
    },
  };

  static editor = {
    label: "Html2d",
  };
}
