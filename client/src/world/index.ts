import { WorldManager } from "./WorldManager";

export const worldManager = new WorldManager();

// For debugging in JS console
(window as any).relm = worldManager;
