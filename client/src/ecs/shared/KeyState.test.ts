import { newKeyState, transition, KPR, LONG_THRESHOLD } from "./KeyState";

describe("KeyState", () => {
  let keyState;
  let now;

  beforeEach(() => {
    keyState = newKeyState();
    now = 0;
  });

  test("short press", () => {
    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.Pressed);
  });

  test("double press, too short", () => {
    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.Pressed);

    transition(keyState, false, ++now);
    expect(keyState.state).toEqual(KPR.Released);

    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.Pressed);
  });

  test("double press, long enough", () => {
    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.Pressed);

    now += LONG_THRESHOLD;
    transition(keyState, true, now);
    expect(keyState.state).toEqual(KPR.LongPressed);

    transition(keyState, false, ++now);
    expect(keyState.state).toEqual(KPR.LongPressedReleased);

    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.DoublePressed);
  });

  test("triple press is same as double press", () => {
    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.Pressed);

    now += LONG_THRESHOLD;
    transition(keyState, true, now);
    expect(keyState.state).toEqual(KPR.LongPressed);

    transition(keyState, false, ++now);
    expect(keyState.state).toEqual(KPR.LongPressedReleased);

    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.DoublePressed);

    transition(keyState, false, ++now);
    expect(keyState.state).toEqual(KPR.DoublePressed);

    transition(keyState, true, ++now);
    expect(keyState.state).toEqual(KPR.DoublePressed);
  });
});
