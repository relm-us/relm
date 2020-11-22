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

export type YIDSTR = string;
export type HECSID = string;
