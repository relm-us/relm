import { Vector3 } from "hecs-plugin-core";

export const playerForce = new Vector3();
export const playerForces = {
  up: new Vector3(),
  down: new Vector3(),
  left: new Vector3(),
  right: new Vector3(),
};
