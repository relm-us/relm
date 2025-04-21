export const messageSync = 0
export const messageAwareness = 1
export const messageAuth = 2
export const messageQueryAwareness = 3

export const reconnectTimeoutBase = 1200
export const maxReconnectTimeout = 2500
export const messageReconnectTimeout = 30000
export const pingTimeout = 30000

export const wsReadyStateConnecting = 0
export const wsReadyStateOpen = 1

// disable gc when using snapshots!
export const GC_ENABLED = getEnv("GC") !== "false" && getEnv("GC") !== "0"
export const CALLBACK_DEBOUNCE_WAIT = 2000
export const CALLBACK_DEBOUNCE_MAXWAIT = 10000

function isNode() {
  return typeof process !== undefined
}

export function getEnv(key) {
  if (isNode()) {
    return process.env[key]
  }

  return null
}

export function addUnloadListener(fn) {
  if (isNode()) {
    process.on("exit", fn)
  } else {
    window.addEventListener("beforeunload", fn)
  }
}

export function removeUnloadListener(fn) {
  if (isNode()) {
    process.off("exit", fn)
  } else {
    window.removeEventListener("beforeunload", fn)
  }
}
