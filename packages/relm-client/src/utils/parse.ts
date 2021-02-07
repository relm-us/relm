export function parse(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return undefined;
  }
  return json;
}
