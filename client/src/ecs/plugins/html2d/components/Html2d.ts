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
  kind: string;
  offset: Vector3;
  width: number;
  vanchor: number;
  hanchor: number;
  color: string;
  shadowColor: string;
  underlineColor: string;
  title: string;
  link: string;
  content: string;
  editable: boolean;
  visible: boolean;
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
          { label: "Emoji", value: "EMOJI" },
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
        requires: [{ prop: "kind", value: "INFO" }],
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
      },
    },

    editable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Editable",
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
      default: true,
      editor: {
        label: "Zoom Invariant"
      }
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
