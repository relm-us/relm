import { callEach } from "~/utils/callEach"

export type Action = (pressed: boolean, options?) => void

export const comboTable = new Map()

function assertModifier(mod, desc) {
  if (mod !== "A" && mod !== "C" && mod !== "S" && mod !== "M") {
    throw Error(`not a modifer: ${mod} (${desc})`)
  }
}

/**
 * Validates a key combo string.
 *
 * @param desc A key combo in the from [MODIFIER-*][KEY], e.g. "C-S z"
 * @returns The canonical form of the key combo, or throws an error.
 */
export function canonical(desc: string): string {
  let [key, mods] = desc.split(/\s+/).reverse()
  if (mods) {
    const modifiers = mods.split("-").sort()
    modifiers.forEach((m) => assertModifier(m, desc))
    return modifiers.join("-") + " " + key
  } else {
    return key
  }
}

/**
 *
 * @param context The program context in which the key combos is valid
 * @param keyCombos A list of (equivalent) key combinations
 * @param action A function that is to be called when the key combo is pressed
 */
export function registerAction(contexts: string[], keyCombos: string[], action: Action): Function {
  const unregisters = contexts.flatMap((context) =>
    keyCombos.map((combo) => {
      const id = context + ":" + canonical(combo)
      if (comboTable.has(id)) {
        throw Error(`comboTable already has ${id}`)
      } else {
        comboTable.set(id, action)
      }
      return () => comboTable.delete(id)
    }),
  )
  return () => callEach(unregisters)
}

/**
 * Fast action lookup for key combination. Does not check for validity.
 *
 * @param context
 * @param keyCombo
 * @returns
 */
export function getCanonicalAction(context: string, keyCombo: string): Action {
  const id = context + ":" + keyCombo
  return comboTable.get(id)
}

export function getAction(context: string, keyCombo: string): Action {
  return getCanonicalAction(context, canonical(keyCombo))
}

export function releaseAllKeys() {
  for (let action of comboTable.values()) {
    action(false)
  }
}
