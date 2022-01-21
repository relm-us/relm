import { Dispatch } from "../ProgramTypes";

let rapier;

export async function importPhysicsEngine(dispatch: Dispatch) {
  if (!rapier) {
    try {
      rapier = await import("@dimforge/rapier3d");
    } catch (err) {
      const message = `Can't load physics engine rapier3d`;
      dispatch({ id: "error", message, stack: err.stack });
      return;
    }
  }

  dispatch({
    id: "importedPhysicsEngine",
    physicsEngine: rapier,
  });
}
