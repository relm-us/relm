import { Vector2 } from "three";

export const Vector2Type = {
  name: "Vector2",
  initial(value) {
    const v = new Vector2();
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
