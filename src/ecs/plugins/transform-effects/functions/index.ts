import { Vector3, Quaternion, Euler, Matrix4 } from "three";

export type TransformationFunction = {
  initial: (params: any) => object; // return initial state
  compute: (
    matrix: Matrix4,
    state: any,
    params: any,
    delta: number
  ) => boolean | void; // return true if complete
};

/**
 * Various transition functions that take an angle and return a number between 0 and 1
 */
const cyclicTheta = {
  oscillate: (theta) => (Math.cos(theta) + 1) / 2,
  bounce: (theta) => Math.abs(Math.cos(theta / 2)),
  "bounce-pause": (theta) => {
    const alpha = Math.cos(theta);
    return alpha < 0 ? 0 : alpha;
  },
};

/**
 * Initializes a cyclic function.
 *
 * @param params initial cyclic state
 * @param params.phase phase to begin the cycle (radians). Default is 0.
 * @param params.frequency how many cycles per second. Default is 1 Hertz.
 * @param params.cycles the number of cycles to perform. Set to -1 for infinite.
 */
function initCyclic({ phase = Math.PI * 0, frequency = 1, cycles = -1 }) {
  return {
    phase,
    frequency,
    cycles,
    cycleAngle: 0,
    angle: phase / frequency,
  };
}

/**
 * Helps compute a cyclic function. Provides `alpha` (a number from 0 to 1,
 * indicating the ratio between beginning and ending positions of the cycle) to
 * a callback, and ends the cyclic function if it has a finite number of cycles.
 *
 * @param state State of the function (preserved between calls)
 * @param delta The time delta since the last call
 * @param callback A function to perform
 */
function computeCyclic(
  state: any,
  delta: number,
  alphaFunction: Function,
  callback: (alpha: number) => void
) {
  const theta = state.angle * state.frequency - Math.PI;
  const angleIncrease = (Math.PI * 2) / (1000 / delta);
  state.cycleAngle += angleIncrease;
  state.angle += angleIncrease;

  callback(alphaFunction(theta));

  return (
    state.cycles >= 0 &&
    state.cycleAngle * state.frequency >= state.cycles * Math.PI * 2
  );
}

const functions: Record<string, TransformationFunction> = {
  "random-position": {
    initial: (params) => ({}),
    compute: (matrix, state, params, delta) => {
      matrix.makeTranslation(Math.random(), Math.random(), Math.random());
    },
  },
  "oscillate-position": {
    initial: (params) =>
      Object.assign(initCyclic(params), {
        min: params.min ? params.min : new Vector3(0, 0, 0),
        max: params.max ? params.max : new Vector3(0, 1, 0),
        v: new Vector3(),
        alphaFunction: cyclicTheta[params.type || "oscillate"],
      }),
    compute: (matrix, state, params, delta) =>
      computeCyclic(state, delta, state.alphaFunction, (alpha) => {
        state.v.copy(state.min).lerp(state.max, alpha);
        matrix.setPosition(state.v);
      }),
  },
  "oscillate-rotation": {
    initial: (params) =>
      Object.assign(initCyclic(params), {
        min:
          params.min ||
          new Quaternion().setFromEuler(new Euler(0, -Math.PI / 4, 0)),
        max:
          params.max ||
          new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0)),
        q: new Quaternion(),
        alphaFunction: cyclicTheta[params.type || "oscillate"],
      }),
    compute: (matrix, state, params, delta) =>
      computeCyclic(state, delta, state.alphaFunction, (alpha) => {
        state.q.copy(state.min).slerp(state.max, alpha);
        matrix.identity().makeRotationFromQuaternion(state.q);
      }),
  },
  "oscillate-scale": {
    initial: (params) =>
      Object.assign(initCyclic(params), {
        min: params.min ? params.min : new Vector3(1, 1, 1),
        max: params.max ? params.max : new Vector3(2, 2, 2),
        v: new Vector3(),
        alphaFunction: cyclicTheta[params.type || "oscillate"],
      }),
    compute: (matrix, state, params, delta) =>
      computeCyclic(state, delta, state.alphaFunction, (alpha) => {
        state.v.copy(state.min).lerp(state.max, alpha);
        matrix.identity().scale(state.v);
      }),
  },

  position: {
    initial: ({ position = new Vector3() }) => ({ position }),
    compute: (matrix, state, params) => {
      matrix
        .identity()
        .setPosition(params.position.x, params.position.y, params.position.z);
    },
  },
};

export default functions;
