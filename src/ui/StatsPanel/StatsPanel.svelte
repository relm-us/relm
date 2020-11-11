<script>
  import Header from "./Header.svelte";
  import Pane from "./Pane.svelte";
  import PaneStats from "./PaneStats.svelte";
  import Button from "~/ui/Button";

  import {
    fpsTime,
    deltaTime,
    renderCalls,
    renderTriangles,
    memoryGeometries,
    memoryTextures,
    programs,
    systems,
  } from "~/world/stats";

  let renderStatsVisible = false;
  let systemsVisible = false;
  let shadersVisible = false;
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

  table {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }
</style>

<panel>
  <Header>Performance</Header>

  <PaneStats
    dataStore={fpsTime}
    value={($fpsTime[0] || 0).toFixed(1)}
    maximum={60}>
    FPS
  </PaneStats>

  <PaneStats dataStore={deltaTime} value={($deltaTime[0] || 0).toFixed(1)}>
    Millis
  </PaneStats>

  <Button
    style="margin-top:8px"
    on:click={() => {
      renderStatsVisible = !renderStatsVisible;
    }}>
    {renderStatsVisible ? 'Hide' : 'Show'}
    Render Stats
  </Button>

  {#if renderStatsVisible}
    <PaneStats dataStore={renderCalls}>Render Calls</PaneStats>
    <PaneStats dataStore={renderTriangles}>Triangles</PaneStats>
    <PaneStats dataStore={memoryGeometries}>Geometries</PaneStats>
    <PaneStats dataStore={memoryTextures}>Textures</PaneStats>
  {/if}

  <Button
    style="margin-top:8px"
    on:click={() => {
      systemsVisible = !systemsVisible;
    }}>
    {systemsVisible ? 'Hide' : 'Show'}
    Systems
  </Button>

  {#if systemsVisible}
    {#each Object.entries($systems) as [systemName, systemStatsStore]}
      <PaneStats dataStore={systemStatsStore}>{systemName}</PaneStats>
    {/each}
  {/if}

  <Button
    style="margin-top:8px"
    on:click={() => {
      shadersVisible = !shadersVisible;
    }}>
    {shadersVisible ? 'Hide' : 'Show'}
    Shaders
  </Button>

  {#if shadersVisible}
    <Pane title="Shaders">
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
    </Pane>
  {/if}
</panel>
