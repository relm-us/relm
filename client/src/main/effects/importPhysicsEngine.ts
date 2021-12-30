import { Dispatch } from "../RelmStateAndMessage";

export async function importPhysicsEngine(dispatch: Dispatch) {
  let rapier;
  try {
    rapier = await import("@dimforge/rapier3d");
  } catch ({ errmsg, stack }) {
    const message = `Can't load physics engine rapier3d: ${errmsg}`;
    dispatch({ id: "error", message, stack });
    return;
  }

  dispatch({
    id: "importedPhysicsEngine",
    physicsEngine: rapier,
  });
}
