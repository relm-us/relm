<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { localAudioTrack, localVideoTrack } from "video-mirror";
  import { audioDesired } from "~/stores/audioDesired";
  import { videoDesired } from "~/stores/videoDesired";

  import { worldManager } from "~/world";

  import { viewportSize, viewport } from "~/stores";
  import { targetFps } from "~/stores/targetFps";
  import { fpsTime } from "~/stores/stats";
  import { Participant } from "~/types";
  import { State } from "~/main/ProgramTypes";

  export let state: State;

  let minimized = true;
  let subtitle;

  $: subtitle =
    state.worldDocStatus +
    ` : ${Math.ceil(
      $fpsTime.reduce((cumu, val) => cumu + val, 0) / $fpsTime.length
    )} / ${Math.ceil($targetFps)} fps`;

  let vw;
  $: vw = $viewportSize
    ? `(${$viewportSize.width},${$viewportSize.height})`
    : "";

  let showAbbreviatedRoom = true;
  function toggleRoom() {
    showAbbreviatedRoom = !showAbbreviatedRoom;
  }

  let showAbbreviatedIdentities = true;
  function toggleIdentities() {
    showAbbreviatedIdentities = !showAbbreviatedIdentities;
  }

  let idActive = 0;
  let idTotal = 0;
  let identities = [];

  onMount(() => {
    const interval = setInterval(() => {
      if (minimized) return;

      if (worldManager.participants.actives.length !== idActive)
        idActive = worldManager.participants.actives.length;

      if (worldManager.participants.participants.size !== idTotal)
        idTotal = worldManager.participants.participants.size;

      identities = [...worldManager.participants.participants.values()];
      identities.sort((a: Participant, b: Participant) => {
        return a.lastSeen - b.lastSeen;
      });
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<container class:connected={Boolean(state.worldDoc)}>
  <Pane title="Status" {subtitle} showMinimize={true} bind:minimized>
    <inner-scroll>
      <table>
        <tr>
          <th>audio</th>
          <td>
            {$audioDesired ? "desired" : ""}
            {$localAudioTrack ? "recording" : ""}
            <!-- {$audioProducing ? "sending" : ""} -->
          </td>
        </tr>
        <tr>
          <th>video</th>
          <td>
            {$videoDesired ? "desired" : ""}
            {$localVideoTrack ? "recording" : ""}
            <!-- {$videoProducing ? "sending" : ""} -->
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
                {#if identity.isLocal}
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
    min-width: 180px;
    --pane-width: 160px;
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
