import { Component, StringType, BooleanType, JSONType } from "~/ecs/base";

export class Document extends Component {
  docId: string;
  bgColor: string;
  borderColor: string;
  editable: boolean;

  static props = {
    docId: {
      type: StringType,
      default: "doc1",
      editor: {
        label: "Document ID",
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
      default: false,
      editor: {
        label: "Editable",
      },
    },
  };

  static editor = {
    label: "Document",
  };
}
