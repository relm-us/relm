import type { WorldUIMode } from "~/stores/worldUIMode";
import type { Entity } from "~/ecs/base";

import { TypedEmitter } from "tiny-typed-emitter";

import { worldManager } from "~/world";

import { onUndo, onRedo } from "./onUndoRedo";
import { onDelete } from "./onDelete";
import { onEscape } from "./onEscape";
import { onSwitchMode } from "./onSwitchMode";
import { onInteractOtherAvatar } from "./onInteractOtherAvatar";
import "./keyboardControl";
import { releaseHeldKeys } from "./keyboardControl";

export type GlobalEvents = {
  "undo": () => void;
  "redo": () => void;
  "delete": () => void;
  "escape": () => void;
  "switch-mode": (switchTo?: WorldUIMode) => void;

  "action": () => void;
  "focus-entity": (entity: Entity, kind: "proximity" | "pointer") => void;
  "sit-ground": () => void;
  "interact-other-avatar": (participantId: string) => void;

  "cycle-advanced-edit": () => void;
  "toggle-drag-action": () => void;
  "toggle-selection-as-group": () => void;
  "camera-rotate-left": () => void;
  "camera-rotate-right": () => void;

  "release-held-keys": () => void;
};

export class GlobalEventEmitter extends TypedEmitter<GlobalEvents> {}

export const globalEvents = new GlobalEventEmitter();

globalEvents.on("undo", onUndo);
globalEvents.on("redo", onRedo);

globalEvents.on("delete", onDelete);
globalEvents.on("escape", onEscape);

globalEvents.on("switch-mode", onSwitchMode);

globalEvents.on("action", () => worldManager.action());

globalEvents.on("interact-other-avatar", onInteractOtherAvatar);

globalEvents.on("release-held-keys", releaseHeldKeys);
