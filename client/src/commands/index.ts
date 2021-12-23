import { createPrefab } from "./createPrefab";

export const commands = { createPrefab };

export const runCommand = (name, ...args) => {
  if (name in commands) {
    const { params, command } = commands[name];
    // TODO: validate args against params
    command(...args);
  } else {
    throw new Error(`Command not found: '${name}'`);
  }
};
