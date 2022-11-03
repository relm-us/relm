import {
  Component,
  StringType,
  BooleanType,
  JSONType,
  RefType,
} from "~/ecs/base";

export class Document extends Component {
  docId: string;
  bgColor: string;
  borderColor: string;
  editable: boolean;
  simpleMode: boolean;

  emptyFormat: Record<string, string>;
  placeholder: string;

  static props = {
    docId: {
      type: StringType,
      default: "doc1",
      editor: {
        label: "Document ID",
      },
    },

    placeholder: {
      type: StringType,
      default: "Start collaborating...",
      editor: {
        label: "Placeholder",
      },
    },

    pageList: {
      type: JSONType,
      default: [],
      editor: {
        label: "Pages",
      },
    },

    bgColor: {
      type: StringType,
      default: "#ffffff",
      editor: {
        label: "Background Color",
        input: "Color",
      },
    },

    editable: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Editable",
      },
    },

    simpleMode: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Simple Mode",
      },
    },

    // An array of QuillJS formatting that will be applied whenever the doc is empty
    emptyFormat: {
      type: JSONType,
      default: null,
      editor: {
        label: "Default Formatting",
      },
    },
  };

  static editor = {
    label: "Document",
  };
}
