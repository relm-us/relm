import EventEmitter from "eventemitter3";

import { onCopy, onPaste } from "./copyPaste";

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
