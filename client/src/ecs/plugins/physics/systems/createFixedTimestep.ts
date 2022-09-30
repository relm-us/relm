const MAX_STEPS = 5;

// Return a function that calls a callback as many times
// as needed in order to "catch up" to the current time
export function createFixedTimestep(
  timestep: number /* e.g. 1/60 of a second */,
  callback: (delta: number) => void
) {
  let accumulator = 0;
  return (delta: number) => {
    // catch up via physics engine dt
    if (delta <= 2 * timestep) {
      callback(delta);
      accumulator = 0;
    } else {
      // catch up via multiple physics engine steps
      accumulator += delta;
      let step = 0;
      while (accumulator >= timestep) {
        callback(timestep);
        if (step >= MAX_STEPS) {
          // give up, we've reached max allowable physics steps
          accumulator = 0;
          break;
        } else if (accumulator >= 1) {
          // give up, too slow to catch up
          accumulator = 0;
          break;
        } else {
          accumulator -= timestep;
        }
        step++;
      }
    }
  };
}
