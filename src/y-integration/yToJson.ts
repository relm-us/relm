import {
  YEntity,
  YMeta,
  YChildren,
  YComponents,
  YComponent,
  YValues,
} from "./types";

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
