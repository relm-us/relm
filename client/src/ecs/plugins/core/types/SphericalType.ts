import { Spherical } from "three";

export const SphericalType = {
  name: "Spherical",
  initial(value) {
    const v = new Spherical();
    if (value) v.copy(value);
    return v;
  },
  toJSON(value) {
    return [value.radius, value.phi, value.theta];
  },
  fromJSON(data, value) {
    return value.set(data[0], data[1], data[2]);
  },
};
