import { Vector3 } from "three";
import { BooleanType, Component } from "~/ecs/base";
import { Asset, AssetType, Vector3Type } from "~/ecs/plugins/core";

export class Model3 extends Component {
  asset: Asset;
  offset: Vector3;

  // Boolean indicating use of original erroneous box size calculation
  compat: boolean;

  needsRebuild: boolean;

  static props = {
    asset: {
      type: AssetType,
      editor: {
        label: "Model Asset",
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
    },

    compat: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Compatibility Mode",
      },
    },
  };

  static editor = {
    label: "Model",
  };
}
