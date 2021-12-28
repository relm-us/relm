import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { createECSWorld } from "../world/createECSWorld";
import { Dispatch } from "./RelmStateAndMessage";

export const initializeECS = (physicsEngine) => async (dispatch: Dispatch) => {
  dispatch({
    id: "initializedECS",
    ecsWorld: createECSWorld(physicsEngine) as DecoratedECSWorld,
  });
};
