import { Quaternion } from "three";

export const QuaternionType = {
  name: "Quaternion",
  initial(value) {
    const q = new Quaternion();
    if (value) q.copy(value);
    return q;
  },
  toJSON(value) {
    return value.toArray();
  },
  fromJSON(data, value) {
    return value.fromArray(data);
  },
};
