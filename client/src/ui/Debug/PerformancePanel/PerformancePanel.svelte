<script>
  import { onMount } from "svelte";

  import { worldManager } from "~/world";
  import { shadowsEnabled } from "~/stores/shadowsEnabled";

  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import Button from "~/ui/lib/Button";
  import LeftPanel, { Header, Pane } from "~/ui/lib/LeftPanel";

  import StatsPane from "./StatsPane.svelte";
  import SystemToggle from "./SystemToggle.svelte";

  import {
    fpsTime,
    renderCalls,
    renderTriangles,
    programs,
    systems,
  } from "~/stores/stats";

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

  onMount(() => {
    const renderer = worldManager.world.presentation.renderer;
    const interval = setInterval(() => {
      const programsSummary = renderer.info.programs.map((program) => ({
        id: program.id,
        name: program.name,
        usedTimes: program.usedTimes,
        size: program.cacheKey.length,
      }));
      programs.set(programsSummary);
    }, 5000);

    return () => clearInterval(interval);
  });
</script>

<LeftPanel on:minimize>
  <Header>Performance</Header>

  <!-- Frames per second -->
  <StatsPane
    title="FPS"
    minimized={false}
    dataStore={fpsTime}
    value={($fpsTime[0] || 0).toFixed(1)}
    maximum={60}
  />

  <setting>
    <b>Shadows Enabled:</b>
    <ToggleSwitch bind:enabled={$shadowsEnabled} />
  </setting>

  <!-- Show most relevant render stats here -->
  <StatsPane title="Render Calls" dataStore={renderCalls} />
  <StatsPane title="Triangles" dataStore={renderTriangles} />

  <!-- Show most important ECS Systems' performance stats here -->
  {#each primarySystems as [systemName, systemStatsStore]}
    <StatsPane title={systemName} dataStore={systemStatsStore}>
      <SystemToggle name={systemName} />
    </StatsPane>
  {/each}

  <Button
    style="margin-top:8px"
    on:click={() => {
      extendedStatsVisible = !extendedStatsVisible;
    }}
  >
    {extendedStatsVisible ? "Hide" : "Show"}
    Extended Stats
  </Button>

  <Button
    style="margin-top:8px"
    on:click={() => {
      systemsVisible = !systemsVisible;
    }}
  >
    {systemsVisible ? "Hide" : "Show"}
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
    }}
  >
    {shadersVisible ? "Hide" : "Show"}
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

<style>
  table {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }

  setting {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 16px;
  }
  setting b {
    padding-right: 8px;
  }
</style>
