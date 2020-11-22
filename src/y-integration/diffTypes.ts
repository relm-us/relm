export enum DiffKind {
  Add = "N",
  Update = "E",
  Delete = "D",
  Array = "A",
}

export type Diff = AddDiff | UpdateDiff | DeleteDiff | ArrayDiff;

export type AddDiff = {
  kind: "N";
  path: Array<string | number>;
  rhs: any;
};

export type UpdateDiff = {
  kind: "E";
  path: Array<string | number>;
  lhs: any;
  rhs: any;
};

export type DeleteDiff = {
  kind: "D";
  path: Array<string | number>;
  lhs: any;
};

export type ArrayDiff = {
  kind: "A";
  path: Array<string>;
  index: number;
  item: AddDiff | UpdateDiff | DeleteDiff;
};
