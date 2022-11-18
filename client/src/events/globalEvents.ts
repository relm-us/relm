import type { WorldUIMode } from "~/stores/worldUIMode";
import type { Entity, EntityId } from "~/ecs/base";

import { TypedEmitter } from "tiny-typed-emitter";

import { onUndo, onRedo } from "./onUndoRedo";
import { onDelete } from "./onDelete";
import { onEscape } from "./onEscape";
import { onSwitchMode } from "./onSwitchMode";
import { onDropItem } from "./onDropItem";
import { onAction } from "./onAction";
import { onActionLong } from "./onActionLong";
import { onInteractOtherAvatar } from "./onInteractOtherAvatar";

export type GlobalEvents = {
  "undo": () => void;
  "redo": () => void;
  "delete": () => void;
  "escape": () => void;
  "switch-mode": (switchTo?: WorldUIMode) => void;

  "action": () => void;
  "action-long": () => void;
  "highlight-possible-actions": (entityIds: EntityId[]) => void;
  "clear-highlighted-actions": () => void;
  "drop-item": (item: any) => void;
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
globalEvents.on("drop-item", onDropItem);

globalEvents.on("action", onAction);
globalEvents.on("action-long", onActionLong);

globalEvents.on("interact-other-avatar", onInteractOtherAvatar);
