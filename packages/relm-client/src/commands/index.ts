import { worldManager } from "~/stores/worldManager";
import { get } from "svelte/store";

import { createPrefab } from "./createPrefab";

function getWorldManager() {
  const $worldManager = get(worldManager);
  if (!$worldManager) {
    throw new Error("Can't execute command, worldManager not set");
  }
  return $worldManager;
}

export const commands = { createPrefab };

export const runCommand = (name, args) => {
  const $worldManager = getWorldManager();

  if (name in commands) {
    const { params, command } = commands[name];
    // TODO: validate args against params
    command($worldManager, args);
  } else {
    throw new Error(`Command not found: '${name}'`);
  }
};
