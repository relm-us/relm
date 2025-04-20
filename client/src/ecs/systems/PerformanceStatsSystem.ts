import { get } from "svelte/store"

import { System, Groups } from "~/ecs/base"
import type { Presentation } from "~/ecs/plugins/core"

import {
  DATA_WINDOW_SIZE,
  createStatsStore,
  memoryGeometries,
  memoryTextures,
  renderCalls,
  renderTriangles,
  renderFrames,
  systems,
} from "~/stores/stats"

export class PerformanceStatsSystem extends System {
  presentation: Presentation

  // This should happen last, after everything is done, so stats are accurate
  // for the current frame
  order = Groups.Presentation + 500

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    const info = this.presentation?.renderer?.info
    // Rendering performance
    if (info) {
      memoryGeometries.addData(info.memory.geometries)
      memoryTextures.addData(info.memory.textures)
      renderCalls.addData(info.render.calls)
      renderTriangles.addData(info.render.triangles)
      renderFrames.addData(info.render.frame)
    }

    // ECS system performance
    const $systems = get(systems)
    let newSystem = false
    for (const [name, system] of Object.entries(this.world.systems.systemsByName)) {
      if (!$systems[name]) {
        $systems[name] = createStatsStore(DATA_WINDOW_SIZE)
        newSystem = true
      }
      $systems[name].addData((system as any).elapsedTime)
    }
    if (newSystem) {
      systems.set($systems)
    }
  }
}
