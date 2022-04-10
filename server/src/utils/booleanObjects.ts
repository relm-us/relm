import fromEntries from "object.fromentries";

export function arrayToBooleanObject(arr: string[]): Record<string, boolean> {
  return fromEntries(arr.map((value) => [value, true]));
}

export function booleanObjectToArray(obj: Record<string, boolean>): string[] {
  return Object.entries(obj)
    .filter(([key, value]) => value)
    .map(([key, value]) => key);
}
