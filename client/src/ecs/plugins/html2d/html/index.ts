import Emoji from "./Emoji.svelte";
import Info from "./Info.svelte";
import Label from "./Label.svelte";
import Speech from "./Speech.svelte";

export function getHtmlComponent(kind) {
  // prettier-ignore
  switch (kind) {
    case "EMOJI": return Emoji;
    case "INFO": return Info;
    case "LABEL": return Label;
    case "SPEECH": return Speech;
  }
}
