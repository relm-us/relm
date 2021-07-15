import EventEmitter from "eventemitter3";

import { onCopy, onPaste } from "./onCopyPaste";
import { onUndo, onRedo } from "./onUndoRedo";
import { onDelete } from "./onDelete";
import { onEscape } from "./onEscape";
import { onSwitchMode } from "./onSwitchMode";
import { onTogglePause } from "./onTogglePause";
import { onDropItem } from "./onDropItem";
import { onAction } from "./onAction";

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

globalEvents.on("delete", onDelete);
globalEvents.on("escape", onEscape);

globalEvents.on("switch-mode", onSwitchMode);
globalEvents.on("toggle-pause", onTogglePause);
globalEvents.on("drop-item", onDropItem);

globalEvents.on("action", onAction);
