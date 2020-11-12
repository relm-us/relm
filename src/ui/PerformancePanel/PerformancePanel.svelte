<script>
  import PaneStats from "./PaneStats.svelte";

  import Button from "~/ui/Button";
  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";

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
  table {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }
</style>

<LeftPanel>
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
</LeftPanel>
