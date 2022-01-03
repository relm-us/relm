import View from "./View.svelte";
import { Program } from "./Program";

const app = new View({
  target: document.body,
  props: { createApp: (props) => Program },
});

export default app;
