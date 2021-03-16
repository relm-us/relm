import Label from "./Label.svelte";
import Speech from "./Speech.svelte";

export function getHtmlComponent(kind) {
  // prettier-ignore
  switch (kind) {
    case "LABEL": return Label;
    case "SPEECH": return Speech;
  }
}
