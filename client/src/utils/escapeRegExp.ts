const escapeRE = /[.*+?^${}()|[\]\\]/g;

export function escapeRegExp(string) {
  return string.replace(escapeRE, "\\$&"); // $& means the whole matched string
}
