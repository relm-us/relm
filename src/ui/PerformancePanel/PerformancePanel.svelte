<script>
  import StatsPane from "./StatsPane.svelte";

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

  let extendedStatsVisible = false;
  let systemsVisible = false;
  let shadersVisible = false;

  const primarySystemsRE = /(Render|Physics)System/;
  let secondarySystems = [];

  $: primarySystems = Object.entries($systems).filter(([name, _]) =>
    name.match(primarySystemsRE)
  );
  $: secondarySystems = Object.entries($systems).filter(
    ([name, _]) => !name.match(primarySystemsRE)
  );
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

  <!-- Frames per second -->
  <StatsPane
    title="FPS"
    minimized={false}
    dataStore={fpsTime}
    value={($fpsTime[0] || 0).toFixed(1)}
    maximum={60} />

  <!-- Show most relevant render stats here -->
  <StatsPane title="Render Calls" dataStore={renderCalls} />
  <StatsPane title="Triangles" dataStore={renderTriangles} />

  <!-- Show most important ECS Systems' performance stats here -->
  {#each primarySystems as [systemName, systemStatsStore]}
    <StatsPane title={systemName} dataStore={systemStatsStore} />
  {/each}

  <Button
    style="margin-top:8px"
    on:click={() => {
      extendedStatsVisible = !extendedStatsVisible;
    }}>
    {extendedStatsVisible ? 'Hide' : 'Show'}
    Extended Stats
  </Button>

  {#if extendedStatsVisible}
    <StatsPane
      title="Millis"
      dataStore={deltaTime}
      value={($deltaTime[0] || 0).toFixed(1)} />
    <StatsPane title="Geometries" dataStore={memoryGeometries} />
    <StatsPane title="Textures" dataStore={memoryTextures} />
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
    {#each secondarySystems as [systemName, systemStatsStore]}
      <StatsPane title={systemName} dataStore={systemStatsStore} />
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
