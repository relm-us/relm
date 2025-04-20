import type { DecoratedECSWorld } from "~/types"

import { SkyboxRef } from "~/ecs/plugins/skybox"
import { AssetLoaded } from "~/ecs/plugins/asset"
import { ModelAssetLoaded } from "~/ecs/plugins/model"
import { ImageAssetLoaded } from "~/ecs/plugins/image"
import { ShapeAssetLoaded } from "~/ecs/plugins/shape"

import type { WorldDoc } from "~/y-integration/WorldDoc"

import type { Dispatch, State } from "../ProgramTypes"

const ENTITIES_COUNT_IDLE_INC = 5
// Number of assets we will pretend have been loaded; we use
// this because of a bug where--on occasion--worlds don't load
// when one or two assets fail to load, preventing the whole
// world from completing the load process.
const ASSET_FUDGE = 5

let lastEntitiesCount = 0

export const pollLoadingState = (state: State) => async (dispatch: Dispatch) => {
  // If loading is interrupted, don't keep polling
  if (state.doneLoading) return

  dispatch({
    id: "gotLoadingState",
    assetsCount: Math.max(state.assetsCount, countAssets(state.ecsWorld)),
    entitiesCount: Math.max(
      state.entitiesCount,
      // Don't let the entities count stand still
      state.entitiesCount === lastEntitiesCount
        ? Math.min(state.entitiesMax, state.entitiesCount + ENTITIES_COUNT_IDLE_INC)
        : 0,
      countEntities(state.worldDoc),
    ),
  })

  lastEntitiesCount = state.entitiesCount

  setTimeout(() => {
    if (state.entitiesCount < state.entitiesMax || state.assetsCount + ASSET_FUDGE < state.assetsMax) {
      dispatch({ id: "loadPoll" })
    } else {
      dispatch({ id: "loadComplete" })
    }
  }, 100)
}

function countAssets(ecsWorld: DecoratedECSWorld) {
  let count = 0
  for (const [_, e] of ecsWorld.entities.entities) {
    if (
      e.has(AssetLoaded) ||
      e.has(ModelAssetLoaded) ||
      e.has(ShapeAssetLoaded) ||
      e.has(ImageAssetLoaded) ||
      e.has(SkyboxRef)
    ) {
      count++
    }
  }
  return count
}

function countEntities(worldDoc: WorldDoc) {
  return worldDoc.entities.length
}
