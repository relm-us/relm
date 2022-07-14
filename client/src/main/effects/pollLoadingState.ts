import { DecoratedECSWorld } from "~/types";
import { Dispatch, State } from "../ProgramTypes";
import { SkyboxRef } from "~/ecs/plugins/skybox";
import { AssetLoaded } from "~/ecs/plugins/asset";
import { WorldDoc } from "~/y-integration/WorldDoc";

const ENTITIES_COUNT_IDLE_INC = 5;

let lastEntitiesCount = 0;

export const pollLoadingState =
  (state: State) => async (dispatch: Dispatch) => {
    // If loading is interrupted, don't keep polling
    if (state.doneLoading) return;

    dispatch({
      id: "gotLoadingState",
      assetsCount: Math.max(state.assetsCount, countAssets(state.ecsWorld)),
      entitiesCount: Math.max(
        state.entitiesCount,
        // Don't let the entities count stand still
        state.entitiesCount == lastEntitiesCount
          ? Math.min(
              state.entitiesMax,
              state.entitiesCount + ENTITIES_COUNT_IDLE_INC
            )
          : 0,
        countEntities(state.worldDoc)
      ),
    });

    lastEntitiesCount = state.entitiesCount;

    setTimeout(() => {
      if (
        state.entitiesCount < state.entitiesMax ||
        state.assetsCount < state.assetsMax
      ) {
        dispatch({ id: "loadPoll" });
      } else {
        dispatch({ id: "loadComplete" });
      }
    }, 100);
  };

function countAssets(ecsWorld: DecoratedECSWorld) {
  let count = 0;
  ecsWorld.entities.entities.forEach((e) => {
    if (e.has(AssetLoaded)) {
      count++;
    } else if (e.get(SkyboxRef)) {
      count++;
    }
  });
  return count;
}

function countEntities(worldDoc: WorldDoc) {
  return worldDoc.entities.length;
}
