export function parse(text) {
  let json: any
  try {
    json = JSON.parse(text)
  } catch (err) {
    return undefined
  }
  return json
}
