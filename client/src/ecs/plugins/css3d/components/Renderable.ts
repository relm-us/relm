import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";

// TODO: deprecate this at some point
export class Renderable extends Component {
  kind: string;
  embedId: string;
  url: string;
  text: string;
  fontSize: string;
  fontColor: string;
  bgColor: string;
  borderColor: string;
  scale: number;
  editable: boolean;
  alwaysOn: boolean;
  visible: boolean;

  static props = {
    kind: {
      type: StringType,
      default: "LABEL",
    },

    embedId: {
      type: StringType,
      default: "U_u91SjrEOE",
    },

    url: {
      type: StringType,
      default: "https://google.com?igu=1",
    },

    text: {
      type: StringType,
      default: "hello",
    },

    fontSize: {
      type: StringType,
      default: 32,
    },

    fontColor: {
      type: StringType,
      default: "#151515",
    },

    bgColor: {
      type: StringType,
      default: "#fbfbfb",
    },

    borderColor: {
      type: StringType,
      default: "#8b8b8b",
    },

    scale: {
      type: NumberType,
      default: 0.005,
    },

    editable: {
      type: BooleanType,
      default: false,
    },

    alwaysOn: {
      type: BooleanType,
      default: false,
    },

    visible: {
      type: BooleanType,
      default: true,
    },
  };

  static editor = {
    label: "Renderable",
  };
}
