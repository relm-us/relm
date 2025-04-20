<script>
import { onMount } from "svelte"

import { worldManager } from "~/world"

import Button from "~/ui/lib/Button"
import SidePanel, { Header } from "~/ui/lib/SidePanel"
import Pane from "~/ui/lib/Pane"

import StatsPane from "./StatsPane.svelte"
import SystemToggle from "./SystemToggle.svelte"

import { fpsTime, renderCalls, renderTriangles, programs, systems } from "~/stores/stats"

import { _ } from "~/i18n"

let extendedStatsVisible = false
let systemsVisible = false
let shadersVisible = false

const primarySystemsRE = /(Render|Physics)System/
let secondarySystems = []

$: primarySystems = Object.entries($systems).filter(([name, _]) => name.match(primarySystemsRE))
$: secondarySystems = Object.entries($systems).filter(([name, _]) => !name.match(primarySystemsRE))

onMount(() => {
  const renderer = worldManager.world.presentation.renderer
  const interval = setInterval(() => {
    const programsSummary = renderer.info.programs.map((program) => ({
      id: program.id,
      name: program.name,
      usedTimes: program.usedTimes,
      size: program.cacheKey.length,
    }))
    programs.set(programsSummary)
  }, 5000)

  return () => clearInterval(interval)
})
</script>

<SidePanel on:minimize>
  <Header>{$_("PerformancePanel.performance")}</Header>

  <!-- Frames per second -->
  <StatsPane
    title={$_("PerformancePanel.fps")}
    minimized={false}
    dataStore={fpsTime}
    value={($fpsTime[0] || 0).toFixed(1)}
    maximum={60}
  />

  <!-- Show most relevant render stats here -->
  <StatsPane title={$_("PerformancePanel.render_calls")} dataStore={renderCalls} />
  <StatsPane title={$_("PerformancePanel.triangles")} dataStore={renderTriangles} />

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
    {$_("PerformancePanel.extended_stats")}
  </Button>

  <Button
    style="margin-top:8px"
    on:click={() => {
      systemsVisible = !systemsVisible;
    }}
  >
    {systemsVisible ? "Hide" : "Show"}
    {$_("PerformancePanel.systems")}
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
    {$_("PerformancePanel.shaders")}
  </Button>

  {#if shadersVisible}
    <Pane title="Shaders">
      <table>
        <tr>
          <th>{$_("PerformancePanel.id")}</th>
          <th>{$_("PerformancePanel.name")}</th>
          <th>{$_("PerformancePanel.used")}</th>
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
</SidePanel>

<style>
  table {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
  }
</style>
