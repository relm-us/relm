import EventEmitter from "eventemitter3";

import { onCopy, onPaste } from "./copyPaste";
import { onUndo, onRedo } from "./undoRedo";
import { onSwitchMode } from "./switchMode";
import { onDropItem } from "./dropItem";

// This is a global event emitter. It should be used sparingly.
export const globalEvents = new EventEmitter();

/**
 * Global Events:
 *
 * action: spacebar was pressed
 * copy: user sent a "copy" request (e.g. ctrl-C on Windows, cmd-C on Mac)
 * paste: user sent a "paste" request (e.g. ctrl-C on Windows, cmd-C on Mac)
 *
 */

globalEvents.on("copy", onCopy);
globalEvents.on("paste", onPaste);

globalEvents.on("undo", onUndo);
globalEvents.on("redo", onRedo);

globalEvents.on("switch-mode", onSwitchMode);
globalEvents.on("drop-item", onDropItem);
