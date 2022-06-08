import { escapeRegExp } from "./escapeRegExp";

export function removeLeading(target: string, leading: string) {
  return target.replace(new RegExp(`^${escapeRegExp(leading)}`), "");
}
