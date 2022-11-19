import type { WorldUIMode } from "~/stores/worldUIMode";
import type { Entity } from "~/ecs/base";

import { TypedEmitter } from "tiny-typed-emitter";

import { onUndo, onRedo } from "./onUndoRedo";
import { onDelete } from "./onDelete";
import { onEscape } from "./onEscape";
import { onSwitchMode } from "./onSwitchMode";
import { onInteractOtherAvatar } from "./onInteractOtherAvatar";
import { worldManager } from "~/world";

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

  "toggle-advanced-edit": () => void;
  "toggle-drag-action": () => void;
  "toggle-selection-as-group": () => void;
  "camera-rotate-left": () => void;
  "camera-rotate-right": () => void;
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
