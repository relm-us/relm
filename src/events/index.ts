import EventEmitter from "eventemitter3";
import { worldManager } from "~/world";

// This is a global event emitter. It should be used sparingly.
const globalEvents = new EventEmitter();
export default globalEvents;

globalEvents.on("action", () => {
  // worldManager.step();
});
