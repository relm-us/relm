import EventEmitter from "eventemitter3";

import { onUndo, onRedo } from "./onUndoRedo";
import { onDelete } from "./onDelete";
import { onEscape } from "./onEscape";
import { onSwitchMode } from "./onSwitchMode";
import { onDropItem } from "./onDropItem";
import { onAction } from "./onAction";
import { onSit } from "./onSit";

// This is a global event emitter. It should be used sparingly.
export const globalEvents = new EventEmitter();

globalEvents.on("undo", onUndo);
globalEvents.on("redo", onRedo);

globalEvents.on("delete", onDelete);
globalEvents.on("escape", onEscape);

globalEvents.on("switch-mode", onSwitchMode);
globalEvents.on("drop-item", onDropItem);

globalEvents.on("action", onAction);
globalEvents.on("sit", onSit);
