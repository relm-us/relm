import * as Y from "yjs";

export type Collection = {
  id: string;
  name: string;
  category: Category;
  items: Array<Item>;
  thumbnail?: string;
};

export type Category = "favorite" | "relm" | "library";

export type Item = {
  id: string;
  originalId: string;
  name: string;
  orientation: "up" | "down";
  base: number;
  size: { w: number; h: number; d: number };
  thumbnail?: string;
  asset?: string;
};

export type ItemStore = {
  subscribe: Function;
  y: Y.Array<Item>;
};
