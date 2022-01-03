// Assert something exists or throw an error
export function exists(value, name = "value") {
  if (value === null || value === undefined)
    throw new Error(`expected ${name} to exist (${value})`);
}
