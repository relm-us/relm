import * as Y from "yjs";

// YEntities [YEntity]
export type YEntities = Y.Array<YEntity>;

// YEntity { id: string, name: string, parent: string, children: YChildren, meta: YMeta, components: YComponents }
export type YEntity = Y.Map<string | YMeta | YChildren | YComponents>;

// YMeta {}
export type YMeta = Y.Map<string>;

// YChildren [string]
export type YChildren = Y.Array<string>;

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

export type YIDSTR = string;
export type HECSID = string;

export function yIdToString(yId: Y.ID): YIDSTR {
  return `${yId.client}-${yId.clock}`;
}

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

export function withMapEdits<T>(
  event: Y.YMapEvent<T>,
  callbacks: {
    onAdd?: (key: string, content: T) => void;
    onUpdate?: (key: string, content: T, oldContent: T) => void;
    onDelete?: (key: string, content: T, oldContent: T) => void;
  }
) {
  for (const key of event.keysChanged) {
    const value: T = (event.target as Y.Map<T>).get(key);
    const change: YMapChange = event.changes.keys.get(key);
    switch (change.action) {
      case "add":
        if (callbacks.onAdd) {
          callbacks.onAdd(key, value);
        }
        break;
      case "update":
        if (callbacks.onUpdate) {
          callbacks.onUpdate(key, value, change.oldValue);
        }
        break;
      case "delete":
        if (callbacks.onDelete) {
          callbacks.onDelete(key, value, change.oldValue);
        }
        break;
    }
  }
}

export function yEntityToJSON(yentity: YEntity) {
  return {
    id: yentity.get("id") as string,
    name: yentity.get("name") as string,
    parent: yentity.get("parent") as string,
    children: (yentity.get("children") as YChildren).toJSON(),
    meta: (yentity.get("meta") as YMeta).toJSON(),
    ...yComponentsToJSON(yentity.get("components") as YComponents),
  };
}

export function yComponentsToJSON(ycomponents: YComponents) {
  let json = {};
  for (const ycomponent of ycomponents) {
    json = { ...yComponentToJSON(ycomponent) };
  }
  return json;
}

export function yComponentToJSON(ycomponent: YComponent) {
  const name = ycomponent.get("name") as string;
  const yvalues: YValues = ycomponent.get("values") as YValues;
  return {
    [name]: yvalues.toJSON(),
  };
}

export function addYComponentsToEntity(entity, ycomponents: YComponents) {
  for (const ycomponent of ycomponents) {
    const name = ycomponent.get("name");
    const yvalues: YValues = ycomponent.get("values") as YValues;

    const Component = entity.world.components.getByName(name);
    if (!Component) {
      throw new Error(`Component not found: ${name}`);
    }
    // TODO: Optimize toJSON/fromJSON shortcut
    entity.add(Component, undefined, true).fromJSON(yvalues.toJSON());
  }
}
