import Label from "./Label.svelte";

export function getHtmlComponent(kind) {
  switch (kind) {
    case "LABEL":
      return Label;
  }
}
