export type Diff = Array<Change>

export type Change = AddChange | UpdateChange | DeleteChange | ArrayChange

export type AddChange = {
  kind: "N"
  path: Array<string | number>
  rhs: any
}

export type UpdateChange = {
  kind: "E"
  path: Array<string | number>
  lhs: any
  rhs: any
}

export type DeleteChange = {
  kind: "D"
  path: Array<string | number>
  lhs: any
}

export type ArrayChange = {
  kind: "A"
  path: Array<string>
  index: number
  item: AddChange | UpdateChange | DeleteChange
}

export enum ChangeKind {
  Add = "N",
  Update = "E",
  Delete = "D",
  Array = "A",
}
