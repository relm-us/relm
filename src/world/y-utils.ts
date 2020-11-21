import * as Y from "yjs";

// YEntities [YEntity]
export type YEntities = Y.Array<YEntity>;

// YEntity { name: string, components: YComponents }
export type YEntity = Y.Map<string | YComponents>;

// YComponents [YComponent]
export type YComponents = Y.Array<YComponent>;

// YComponent { name: string, values: YValues }
export type YComponent = Y.Map<string | YValues>;

// YValues { [property]: YValue }
export type YValues = Y.Map<YValue>;

// YValue is leaf of valid JSON
export type YValue = boolean | number | string | object | Array<YValue>;

type YMapChange = {
  action: "add" | "update" | "delete";
  oldValue: any;
};

export function yIdToHecsId(yId) {
  return `${yId.client}-${yId.clock}`;
}

export function hecsIdToYId(hecsId) {
  const parts = hecsId.split("-");
  return { client: parts[0], clock: parts[1] };
}

export function withArrayEdits<T>(
  event: Y.YArrayEvent<T>,
  callbacks: {
    onAdd?: (yId: Y.ID, content: T) => void;
    onDelete?: (yId: Y.ID) => void;
  }
) {
  if (callbacks.onAdd) {
    for (const item of event.changes.added) {
      for (const content of item.content.getContent()) {
        callbacks.onAdd(content._item.id, content.toJSON());
      }
    }
  }

  if (callbacks.onDelete) {
    for (const item of event.changes.deleted) {
      callbacks.onDelete(item.id);
    }
  }
}

export function withMapEdits<T>(
  event: Y.YMapEvent<T>,
  callbacks: {
    onAdd?: (yId: Y.ID, key: string, content: T) => void;
    onUpdate?: (yId: Y.ID, key: string, content: T, oldContent: T) => void;
    onDelete?: (yId: Y.ID, key: string) => void;
  }
) {
  for (const key of event.keysChanged) {
    const yId: Y.ID = event.target._item.id;
    const value: T = (event.target as Y.Map<T>).get(key);
    const change: YMapChange = event.changes.keys.get(key);
    switch (change.action) {
      case "add":
        if (callbacks.onAdd) {
          callbacks.onAdd(yId, key, value);
        }
        break;
      case "update":
        if (callbacks.onUpdate) {
          callbacks.onUpdate(yId, key, value, change.oldValue);
        }
        break;
      case "delete":
        if (callbacks.onDelete) {
          callbacks.onDelete(yId, key);
        }
        break;
    }
  }
}
