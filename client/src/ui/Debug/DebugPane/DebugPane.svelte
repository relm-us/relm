<script lang="ts">
  import type { Participant } from "~/types";

  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { localAudioTrack, localVideoTrack } from "video-mirror";

  import { worldManager } from "~/world";
  import { State } from "~/main/ProgramTypes";
  import { participantId } from "~/identity/participantId";

  import { viewportSize, viewport } from "~/stores";
  import { localIdentityData } from "~/stores/identityData";
  import { fpsTime } from "~/stores/stats";
  import { errorCat } from "~/stores/errorCat";

  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import TextInput from "~/ui/lib/TextInput";

  import { PhysicsSystem } from "~/ecs/plugins/physics/systems";

  export let state: State;

  let minimized = true;

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

  let idActive = 0;
  let idTotal = 0;
  let participants = [];

  let x = 0;
  let y = 0;
  let z = 0;

  onMount(() => {
    const interval = setInterval(() => {
      if (!worldManager.participants || !worldManager.participants.local.avatar)
        return;

      x = worldManager.participants.local.avatar.position.x;
      y = worldManager.participants.local.avatar.position.y;
      z = worldManager.participants.local.avatar.position.z;

      if (minimized) return;

      if (worldManager.participants.actives.length !== idActive)
        idActive = worldManager.participants.actives.length;

      if (worldManager.participants.participants.size !== idTotal)
        idTotal = worldManager.participants.participants.size;

      participants = [...worldManager.participants.participants.values()];
      participants.sort((a: Participant, b: Participant) => {
        return a.lastSeen - b.lastSeen;
      });
    }, 150);
    return () => clearInterval(interval);
  });
</script>

<container class:connected={Boolean(state.worldDoc)}>
  <Pane {title} {subtitle} showMinimize={true} bind:minimized>
    <inner-scroll>
      <table>
        <tr>
          <th>debug physics</th>
          <td>
            <ToggleSwitch bind:enabled={PhysicsSystem.showDebug} />
          </td>
        </tr>
        <tr>
          <th>show errors</th>
          <td>
            <ToggleSwitch bind:enabled={$errorCat} />
          </td>
        </tr>
        <tr>
          <th>framerate</th>
          <td>
            <TextInput
              label="FPS"
              value={worldManager.getTargetFps()}
              on:change={({ detail }) => worldManager.setFps(detail, true)}
            />
          </td>
        </tr>
        <tr>
          <th>audio</th>
          <td>
            {$localIdentityData.showAudio ? "show" : "(hide)"}
            {$localAudioTrack ? "granted" : "(not granted)"}
          </td>
        </tr>
        <tr>
          <th>video</th>
          <td>
            {$localIdentityData.showVideo ? "show" : "(hide)"}
            {$localVideoTrack ? "granted" : "(not granted)"}
          </td>
        </tr>
        <!-- <tr>
          <th>av peers</th>
          <td>{JSON.stringify(peers)}</td>
        </tr> -->
        <tr>
          <th>loading:</th>
          <td>
            <div>(Ent: {state.entitiesCount}/{state.entitiesMax})</div>
            <div>(Ast: {state.assetsCount}/{state.assetsMax})</div>
          </td>
        </tr>
        <!-- <tr><th>physics:</th><td>{$ecsWorld !== null}</td></tr> -->
        <tr><th>viewport:</th><td>{$viewport !== null} {vw}</td></tr>

        {#if showAbbreviatedIdentities}
          <tr>
            <th>identities:</th>
            <td>
              <button on:click={toggleIdentities}>
                {idActive} / {idTotal}
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <th>identities:</th>
            <td />
          </tr>
          {#each participants as participant}
            <tr class="identity-row">
              <th>{participant.identityData.name}</th>
              <td>[{participant.identityData.clientId}] {participant.participantId}</td>
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
    --pane-width: 260px;
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
</style>
