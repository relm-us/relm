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
      while (accumulator >= timestep) {
        callback(timestep);
        if (accumulator >= 1) {
          // give up, too slow to catch up
          accumulator = 0;
        } else {
          accumulator -= timestep;
        }
      }
    }
  };
}
