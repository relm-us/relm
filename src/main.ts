import App from "./App.svelte";
import Stats from "stats.js";

const stats = new Stats(1);
document.body.append(stats.dom);

function updateStats() {
  stats.update();
  requestAnimationFrame(updateStats);
}
updateStats();

const app = new App({
  target: document.body,
});

export default app;
