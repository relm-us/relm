import { System, Groups, Not } from "~/ecs/base";
import { get } from "svelte/store";
import {
  DATA_WINDOW_SIZE,
  createStatsStore,
  memoryGeometries,
  memoryTextures,
  renderCalls,
  renderTriangles,
  renderPoints,
  renderLines,
  renderFrames,
  programs,
  systems,
} from "~/stores/stats";

export class PerformanceStatsSystem extends System {
  programHash: string;

  // This should happen last, after everything is done, so stats are accurate
  // for the current frame
  order = Groups.Presentation + 500;

  init() {
    this.programHash = "";
  }

  update() {
    const info = (this.world as any).presentation?.renderer?.info;
    // Rendering performance
    if (info) {
      memoryGeometries.addData(info.memory.geometries);
      memoryTextures.addData(info.memory.textures);
      renderCalls.addData(info.render.calls);
      renderTriangles.addData(info.render.triangles);
      renderPoints.addData(info.render.points);
      renderLines.addData(info.render.lines);
      renderFrames.addData(info.render.frames);

      // Every once in a while, check to see if there are new shaders, etc.
      if (this.world.version % 500 === 20) {
        const programsSummary = info.programs.map((program) => ({
          id: program.id,
          name: program.name,
          usedTimes: program.usedTimes,
          size: program.cacheKey.length,
        }));
        const programHash = info.programs
          .map((program) => program.name)
          .join("-");
        if (this.programHash !== programHash) {
          programs.set(programsSummary);
          this.programHash = programHash;
        }
      }
    }

    // ECS system performance
    const $systems = get(systems);
    let newSystem = false;
    for (const [name, system] of Object.entries(
      this.world.systems.systemsByName
    )) {
      if (!$systems[name]) {
        $systems[name] = createStatsStore(DATA_WINDOW_SIZE);
        newSystem = true;
      }
      $systems[name].addData((system as any).elapsedTime);
    }
    if (newSystem) {
      systems.set($systems);
    }
  }
}
