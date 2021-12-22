/**
 * A simple way to mark some function parameters as required
 *
 * @param {string} missing - the name of the potentially missing parameter
 */
export function required(missing) {
  throw new Error("Missing " + missing);
}

// Shortcut to Required('parameterName'), e.g. req`parameterName`
export const req = required;
