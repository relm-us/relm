/**
 * Create a small state machine for keypresses so we can track things like
 * long-press and double-press. (For example, "double tap to run").
 */

// Minimum number of milliseconds to consider a key press/release as "long"
export const LONG_THRESHOLD = 100;

/**
 * Use bit 0 for Short/Long and bit 1 for Pressed/Released
 */
const SHORT = 0;
const LONG = 1;
const PRESSED = 0;
const RELEASED = 2;

/**
 * Use bits 2-4 for Key Pressed or Released state (KPR)
 */
// prettier-ignore
export enum KPR {
  LongReleased        = 0,
  Pressed             = 4,
  LongPressed         = 8,
  LongPressedReleased = 12,
  DoublePressed       = 16,
  Released            = 20,
}

export type KeyState = {
  state: KPR;
  transitionedAt?: number;
};

/**
 * Here, we create a very simple map that transitions from:
 * (KPR + Short/Long + Pressed/Release) states -> (KPR) state.
 */
export const STATE_TRANSITION_TABLE = new Map([
  [KPR.LongReleased | SHORT | PRESSED, KPR.Pressed],
  [KPR.LongReleased | LONG | PRESSED, KPR.Pressed],
  [KPR.LongReleased | SHORT | RELEASED, KPR.LongReleased],
  [KPR.LongReleased | LONG | RELEASED, KPR.LongReleased],

  [KPR.Pressed | SHORT | PRESSED, KPR.Pressed],
  [KPR.Pressed | LONG | PRESSED, KPR.LongPressed],
  [KPR.Pressed | SHORT | RELEASED, KPR.Released],
  [KPR.Pressed | LONG | RELEASED, KPR.Released],

  [KPR.LongPressed | SHORT | PRESSED, KPR.LongPressed],
  [KPR.LongPressed | LONG | PRESSED, KPR.LongPressed],
  [KPR.LongPressed | SHORT | RELEASED, KPR.LongPressedReleased],
  [KPR.LongPressed | LONG | RELEASED, KPR.LongPressedReleased],

  [KPR.LongPressedReleased | SHORT | PRESSED, KPR.DoublePressed],
  [KPR.LongPressedReleased | LONG | PRESSED, KPR.DoublePressed],
  [KPR.LongPressedReleased | SHORT | RELEASED, KPR.LongPressedReleased],
  [KPR.LongPressedReleased | LONG | RELEASED, KPR.LongReleased],

  [KPR.DoublePressed | SHORT | PRESSED, KPR.DoublePressed],
  [KPR.DoublePressed | LONG | PRESSED, KPR.DoublePressed],
  [KPR.DoublePressed | SHORT | RELEASED, KPR.DoublePressed],
  [KPR.DoublePressed | LONG | RELEASED, KPR.LongReleased],

  [KPR.Released | SHORT | PRESSED, KPR.Pressed],
  [KPR.Released | LONG | PRESSED, KPR.Pressed],
  [KPR.Released | SHORT | RELEASED, KPR.Released],
  [KPR.Released | LONG | RELEASED, KPR.LongReleased],
]);

export function newKeyState(): KeyState {
  return {
    state: KPR.LongReleased,
    transitionedAt: undefined,
  };
}

export function isKeyActive(keyState: KeyState) {
  return keyState.state >= KPR.Pressed && keyState.state < KPR.Released;
}

export function transition(
  keyState: KeyState,
  pressed: boolean,
  now: number = performance.now()
) {
  const transitionedAgo = keyState.transitionedAt
    ? now - keyState.transitionedAt
    : 0;

  const isLong: number =
    transitionedAgo >=
    (keyState.state === KPR.DoublePressed ? LONG_THRESHOLD * 3 : LONG_THRESHOLD)
      ? LONG
      : SHORT;
  const isPressed: number = pressed ? PRESSED : RELEASED;

  const lookup = keyState.state | isLong | isPressed;
  const newState = STATE_TRANSITION_TABLE.get(lookup);

  if (newState !== keyState.state) {
    keyState.state = newState;
    keyState.transitionedAt = now;
    return true;
  } else {
    return false;
  }
}
