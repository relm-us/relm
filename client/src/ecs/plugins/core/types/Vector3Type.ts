import { Vector3 } from "three";

export const Vector3Type = {
  name: "Vector3",
  initial(value) {
    const v = new Vector3();
    if (value) v.copy(value);
    return v;
  },
  toJSON(value) {
    return value.toArray();
  },
  fromJSON(data, value) {
    return value.fromArray(data);
  },
};
