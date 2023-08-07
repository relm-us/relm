<script lang="ts">
  import type { ParticipantMap } from "~/types";

  import { onMount } from "svelte";
  import { Readable } from "svelte/store";

  import { localAudioTrack, localVideoTrack } from "~/av/VideoMirror";

  import { worldManager } from "~/world";
  import { State } from "~/main/ProgramTypes";
  import { participantId } from "~/identity/participantId";

  import { viewportSize } from "~/stores";
  import { localIdentityData } from "~/stores/identityData";
  import { fpsTime } from "~/stores/stats";

  import { PhysicsSystem } from "~/ecs/plugins/physics/systems";

  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import TextInput from "~/ui/lib/TextInput";

  import Pane from "./Pane.svelte";

  import { _ } from "~/i18n";
  import { intersectCalcTime } from "~/ecs/plugins/camera/systems/CameraSystem";

  export let state: State;
  export let expanded: boolean = false;

  const participants: Readable<ParticipantMap> =
    worldManager.participants.store;

  let fps;
  $: fps = $fpsTime.reduce((cumu, val) => cumu + val, 0) / $fpsTime.length;

  let title;
  $: title =
    `${Math.ceil(fps)} fps ` +
    `@ ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`;

  let subtitle;
  $: subtitle = state.worldDocStatus + " - " + participantId.split("-")[0];

  let vw;
  $: vw = $viewportSize
    ? `(${$viewportSize.width},${$viewportSize.height})`
    : "";

  let showAbbreviatedIdentities = true;
  function toggleIdentities() {
    showAbbreviatedIdentities = !showAbbreviatedIdentities;
  }

  let x = 0;
  let y = 0;
  let z = 0;

  let avgIntersectCalcTime = 0;

  onMount(() => {
    const interval = setInterval(() => {
      if (!worldManager.participants || !worldManager.participants.local.avatar)
        return;

      x = worldManager.participants.local.avatar.position.x;
      y = worldManager.participants.local.avatar.position.y;
      z = worldManager.participants.local.avatar.position.z;

      avgIntersectCalcTime =
        intersectCalcTime.reduce((total, time) => total + time, 0) /
        intersectCalcTime.length;
    }, 150);
    return () => clearInterval(interval);
  });
</script>

<container class:connected={Boolean(state.worldDoc)}>
  <Pane
    {title}
    {subtitle}
    showMinimize={true}
    minimized={!expanded}
    on:minimize
  >
    <inner-scroll>
      <table>
        <tr>
          <th>{$_("DebugPane.debug_physics")}</th>
          <td>
            <ToggleSwitch bind:enabled={PhysicsSystem.showDebug} />
          </td>
        </tr>
        <tr>
          <th>{$_("DebugPane.framerate")}</th>
          <td>
            <TextInput
              label={$_("DebugPane.fps")}
              value={worldManager.getTargetFps()}
              on:change={({ detail }) => worldManager.setFps(parseInt(detail))}
            />
          </td>
        </tr>
        <tr>
          <th>
            {$_("DebugPane.collider_performance")}
          </th>
          <td
            class:green={avgIntersectCalcTime < 1}
            class:red={avgIntersectCalcTime > 3}
            >{avgIntersectCalcTime.toFixed(3)} ms</td
          >
        </tr>
        <tr>
          <th>{$_("DebugPane.audio")}</th>
          <td>
            {$localIdentityData.showAudio ? "show" : "(hide)"}
            {$localAudioTrack ? "granted" : "(not granted)"}
          </td>
        </tr>
        <tr>
          <th>{$_("DebugPane.video")}</th>
          <td>
            {$localIdentityData.showVideo ? "show" : "(hide)"}
            {$localVideoTrack ? "granted" : "(not granted)"}
          </td>
        </tr>
        <tr>
          <th>{$_("DebugPane.loading")}</th>
          <td>
            <div>(Ent: {state.entitiesCount}/{state.entitiesMax})</div>
            <div>(Ast: {state.assetsCount}/{state.assetsMax})</div>
          </td>
        </tr>
        <tr>
          <th>{$_("DebugPane.viewport")}</th>
          <td>{vw}</td>
        </tr>

        {#if showAbbreviatedIdentities}
          <tr>
            <th>{$_("DebugPane.participants")}</th>
            <td>
              <button on:click={toggleIdentities}>
                {$participants.size}
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <th>{$_("DebugPane.participants")}</th>
            <td />
          </tr>
          {#each Array.from($participants.values()) as participant}
            <tr class="identity-row">
              <th>{participant.identityData.name || "(no name)"}</th>
              <td>
                [{participant.identityData.clientId}] {participant.participantId}
              </td>
            </tr>
          {/each}
        {/if}
      </table>
    </inner-scroll>
  </Pane>
</container>

<style>
  container {
    display: flex;
    width: 260px;
    height: min-content;
    --pane-width: 260px;
    --pane-margin: 0;
  }
  container.connected {
    --subtitle-color: rgba(0, 210, 24, 1);
  }
  table {
    color: white;
    margin: 8px;
    width: 240px;
  }
  th {
    text-align: right;
    padding-right: 4px;
    vertical-align: top;
    width: 50%;
  }
  td {
    vertical-align: middle;
    width: 50%;
    font-family: monospace;
    color: gold;
    padding-top: 1px;
  }
  .identity-row th,
  .identity-row td {
    font-size: 10px;
  }

  inner-scroll {
    display: block;
    overflow: auto;
    pointer-events: all;
    max-height: 90vh;
  }

  .green {
    color: rgba(0, 210, 24, 1);
  }
  .red {
    color: red;
  }
</style>
