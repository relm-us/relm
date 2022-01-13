import { Vector3 } from "three";

import { Html2d } from "~/ecs/plugins/html2d";

import { AvatarEntities } from "../types";

const DEFAULT_LABEL_COLOR = "#D0D0D0";

export function setLabel(
  this: void,
  entities: AvatarEntities,
  name: string,
  color: string,
  onDidEdit: (content: string) => void
) {
  if (name && !entities.body.has(Html2d)) {
    addLabel(entities, name, color, onDidEdit);
  } else if (name && entities.body.has(Html2d)) {
    changeLabel(entities, name, color, onDidEdit);
  } else if (!name && entities.body.has(Html2d)) {
    entities.body.remove(Html2d);
  }
}

function addLabel(
  this: void,
  entities: AvatarEntities,
  name: string,
  color: string,
  onDidEdit: (content: string) => void
) {
  entities.body.add(Html2d, {
    kind: "LABEL",
    content: name,
    underlineColor: color || DEFAULT_LABEL_COLOR,
    offset: new Vector3(0, -0.2, 0),
    vanchor: 1,
    editable: !!onDidEdit,
    onChange: onDidEdit,
  });
}

export function changeLabel(
  this: void,
  entities: AvatarEntities,
  name: string,
  color: string,
  onDidEdit: (content: string) => void
) {
  const label = entities.body.get(Html2d);
  if (!label) return;

  let modified = false;
  if (label.content !== name) {
    label.content = name;
    modified = true;
  }

  if (label.editable !== Boolean(onDidEdit)) {
    label.editable = Boolean(onDidEdit);
    label.onChange = onDidEdit;
    modified = true;
  }

  if (label.underlineColor !== color) {
    label.underlineColor = color;
    modified = true;
  }

  if (modified) label.modified();
}
