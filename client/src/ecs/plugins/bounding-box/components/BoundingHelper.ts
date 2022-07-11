import { RefType, LocalComponent, StringType } from "~/ecs/base";

export class BoundingHelper extends LocalComponent {
  static props = {
    color: {
      type: StringType,
      default: "#ffffff",
      editor: {
        label: "Color",
        input: "Color",
      },
    },

    kind: {
      type: StringType,
      default: "BOX",
      editor: {
        label: "Kind",
        options: [
          { label: "Box", value: "BOX" },
          { label: "Sphere", value: "SPHERE" },
        ],
      },
    },
  };

  static editor = {
    label: "Bounding Helper",
  };
}

export class BoundingHelperRef extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
