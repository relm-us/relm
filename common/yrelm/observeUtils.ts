import * as Y from "yjs";

export type YMapChange = {
  action: "add" | "update" | "delete";
  oldValue: any;
};

/**
 * Simplifying sugar for taking action when observing Y.Array changes.
 *
 * @param event the deepObserve Y.Event
 * @param callbacks functions to be called in response to the event
 */
export function withArrayEdits<T>(
  event: Y.YArrayEvent<T>,
  callbacks: {
    onAdd?: (content: T) => void;
    onDelete?: (yId: Y.ID) => void;
  }
) {
  if (callbacks.onAdd) {
    for (const item of event.changes.added) {
      for (const content of item.content.getContent()) {
        callbacks.onAdd(content);
      }
    }
  }

  if (callbacks.onDelete) {
    for (const item of event.changes.deleted) {
      callbacks.onDelete(item.id);
    }
  }
}

/**
 * Simplifying sugar for taking action when observing Y.Map changes.
 *
 * @param event the observe Y.Event
 * @param callbacks functions to be called in response to the event
 */
export function withMapEdits<T>(
  event: Y.YMapEvent<T>,
  callbacks: {
    onAdd?: (key: string, content: T) => void;
    onUpdate?: (key: string, content: T, oldContent: T) => void;
    onDelete?: (key: string, content: T, oldContent: T) => void;
  }
) {
  for (const [key, change] of event.changes.keys.entries()) {
    const value: T = (event.target as Y.Map<T>).get(key);
    if (change.action === "add" && callbacks.onAdd) {
      callbacks.onAdd(key, value);
    } else if (change.action === "update" && callbacks.onUpdate) {
      callbacks.onUpdate(key, value, change.oldValue);
    } else if (change.action === "delete" && callbacks.onDelete) {
      callbacks.onDelete(key, value, change.oldValue);
    }
  }
}
