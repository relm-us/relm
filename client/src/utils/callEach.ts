export function callEach(fns: Function[]) {
  for (const fn of fns) fn();
}
