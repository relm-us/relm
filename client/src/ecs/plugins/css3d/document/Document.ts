import { Component, StringType, BooleanType, JSONType } from "~/ecs/base";

export class Document extends Component {
  docId: string;
  bgColor: string;
  borderColor: string;
  editable: boolean;
  simpleMode: boolean;

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
  };

  static editor = {
    label: "Document",
  };
}
