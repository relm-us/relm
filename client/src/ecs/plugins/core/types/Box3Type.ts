import { Box3 } from "three";

export const Box3Type = {
  name: "Box3",
  initial(value) {
    const b = new Box3();
    if (value) b.copy(value);
    return b;
  },
  toJSON(value) {
    return [...value.min.toArray(), ...value.max.toArray()];
  },
  fromJSON(data, value) {
    value.min.fromArray(data.slice(0, 3));
    value.max.fromArray(data.slice(3, 6));
    return value;
  },
};
