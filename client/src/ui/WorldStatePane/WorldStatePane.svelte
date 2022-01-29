<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { localAudioTrack, localVideoTrack } from "video-mirror";

  import { worldManager } from "~/world";

  import { viewportSize, viewport } from "~/stores";
  import { localIdentityData } from "~/stores/identityData";
  import { targetFps } from "~/stores/targetFps";
  import { fpsTime } from "~/stores/stats";
  import { Participant } from "~/types";
  import { State } from "~/main/ProgramTypes";
  import { playerId } from "~/identity/playerId";

  export let state: State;

  let minimized = true;

  let fps;
  $: fps = $fpsTime.reduce((cumu, val) => cumu + val, 0) / $fpsTime.length;

  let title;
  $: title =
    `${Math.ceil(fps)} fps ` +
    `@ ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`;

  let subtitle;
  $: subtitle = state.worldDocStatus + " - " + playerId.split("-")[0];

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
  let identities = [];

  let x = 0;
  let y = 0;
  let z = 0;

  onMount(() => {
    const interval = setInterval(() => {
      x = worldManager.participants.local.avatar.position.x;
      y = worldManager.participants.local.avatar.position.y;
      z = worldManager.participants.local.avatar.position.z;

      if (minimized) return;

      if (worldManager.participants.actives.length !== idActive)
        idActive = worldManager.participants.actives.length;

      if (worldManager.participants.participants.size !== idTotal)
        idTotal = worldManager.participants.participants.size;

      identities = [...worldManager.participants.participants.values()];
      identities.sort((a: Participant, b: Participant) => {
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
          {#each identities as identity}
            <tr class="identity-row">
              <th>{identity.get("name")}</th>
              <td>
                {#if identity.participantId === playerId}
                  (local)
                {:else if identity.lastSeen === undefined}
                  (not seen)
                {:else}
                  {Math.floor(identity.seenAgo / 1000) + "s"}
                {/if}
                {identity.avatar.distance
                  ? identity.avatar.distance.toFixed(1)
                  : "?"}' [{identity.get("clientId")}]
                {identity.playerId}
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
