import View from "./View.svelte";
import { makeProgram } from "./Program";

const app = new View({
  target: document.body,
  props: { createApp: (props) => makeProgram() },
});

export default app;
