<script>
  import Header from "./Header.svelte";
  import Pane from "./Pane.svelte";
  import Chart from "./Chart.svelte";

  import {
    fpsTime,
    renderCalls,
    renderTriangles,
    memoryGeometries,
    memoryTextures,
    programs,
  } from "~/world/stats";
</script>

<style>
  panel {
    position: fixed;
    z-index: 2;

    display: flex;
    flex-direction: column;

    width: 300px;
    height: 100%;
    left: 0;
    top: 0;

    background-color: rgba(0, 0, 0, 0.45);
    color: #ddd;

    overflow-y: auto;
  }

  lbl {
    background-color: rgba(255, 255, 255, 0.25);
    color: #333;
    display: block;
    padding: 4px 16px;

    font-weight: bold;
  }

  lbl info {
    font-weight: normal;
  }

  info table {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }
</style>

<panel>
  <Header>Render Stats</Header>

  <Pane>
    <lbl>
      FPS
      <info>{($fpsTime[0] || 0).toFixed(1)}</info>
    </lbl>
    <Chart data={$fpsTime} maximum={60} />
  </Pane>

  <Pane>
    <lbl>
      Render Calls
      <info>{$renderCalls[0]}</info>
    </lbl>
    <Chart data={$renderCalls} />
  </Pane>

  <Pane>
    <lbl>
      Triangles
      <info>{$renderTriangles[0]}</info>
    </lbl>
    <Chart data={$renderTriangles} />
  </Pane>

  <Pane>
    <lbl>
      Geometries (mem. used)
      <info>{$memoryGeometries[0]}</info>
    </lbl>
    <Chart data={$memoryGeometries} />
  </Pane>

  <Pane>
    <lbl>
      Textures (mem. used)
      <info>{$memoryTextures[0]}</info>
    </lbl>
    <Chart data={$memoryTextures} />
  </Pane>

  <Pane>
    <lbl>Programs</lbl>
    <info>
      <table>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Used</th>
        </tr>
        {#if $programs}
          {#each $programs as program}
            <tr>
              <td>{program.id}</td>
              <td>{program.name}</td>
              <td>{program.usedTimes}</td>
            </tr>
          {/each}
        {/if}
      </table>
    </info>
  </Pane>
</panel>
