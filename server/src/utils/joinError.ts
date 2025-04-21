export function joinError(error, newError) {
  newError.stack += `\nCaused By:\n${error.stack}`
  return newError
}
