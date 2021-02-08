import { Asset } from "../Asset";

export const AssetType = {
  name: "Asset",
  initial(value) {
    const a = new Asset();
    if (value) a.copy(value);
    return a;
  },
  toJSON(value: Asset) {
    return value.toJSON();
  },
  fromJSON(data, value) {
    return value.fromJSON(data);
  },
};
