import { Relm } from "~/stores/Relm";
import { get } from "svelte/store";

import { createPrefab } from "./createPrefab";

function getRelm() {
  const $Relm = get(Relm);
  if (!$Relm) {
    throw new Error("Can't execute command, worldManager not set");
  }
  return $Relm;
}

export const commands = { createPrefab };

export const runCommand = (name, ...args) => {
  const $Relm = getRelm();

  if (name in commands) {
    const { params, command } = commands[name];
    // TODO: validate args against params
    command($Relm, ...args);
  } else {
    throw new Error(`Command not found: '${name}'`);
  }
};
