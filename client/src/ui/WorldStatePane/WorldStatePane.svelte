<script lang="ts">
  import { onMount } from "svelte";
  import Pane from "./Pane.svelte";

  import { localAudioTrack, localVideoTrack, mediaDesired } from "video-mirror";
  // import { audioProducing, videoProducing } from "~/av/stores/producers";
  import { Identity } from "~/identity/Identity";

  import { worldManager } from "~/world";

  import {
    entryway,
    loadingState,
    setupState,
    subrelm,
    viewportSize,
    viewport,
    yConnectState,
    yLoadingState,
  } from "~/stores";
  import {
    loaded,
    maximum,
    entitiesLoaded,
    entitiesMaximum,
    assetsLoaded,
    assetsMaximum,
  } from "~/stores/loading";

  let minimized = true;

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

      if (worldManager.identities.active !== idActive)
        idActive = worldManager.identities.active;

      if (worldManager.identities.total !== idTotal)
        idTotal = worldManager.identities.total;

      identities = [...worldManager.identities.identities.values()];
      identities.sort((a: Identity, b: Identity) => {
        return a.seenAgo - b.seenAgo;
      });
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<container class:connected={$yConnectState === "connected"}>
  <Pane
    title="Status"
    subtitle={$yConnectState}
    showMinimize={true}
    bind:minimized
  >
    <inner-scroll>
      <table>
        <tr><th>subrelm:</th><td>{$subrelm}</td></tr>
        <tr><th>entryway:</th><td>{$entryway}</td></tr>
        <!-- <tr><th>app state:</th><td>{$appState}</td></tr> -->
        <tr><th>setup state:</th><td>{$setupState}</td></tr>
        <!-- <tr><th>conference:</th><td>{$roomConnectState}</td></tr> -->
        <!-- <tr><th>yjs:</th><td>{$connection.state}<br />{$yLoadingState}</td></tr> -->
        <!-- {#if $connection.state === "connected"}
          <tr>
            <th>yjs room:</th>
            <td>
              {#if showAbbreviatedRoom}
                <button on:click={toggleRoom}>
                  {$connection.room.split("-")[0]}...
                </button>
              {:else}
                {$connection.room}
              {/if}
            </td>
          </tr>
        {/if} -->
        <tr>
          <th>audio</th>
          <td>
            {$mediaDesired.audio ? "desired" : ""}
            {$localAudioTrack ? "recording" : ""}
            <!-- {$audioProducing ? "sending" : ""} -->
          </td>
        </tr>
        <tr>
          <th>video</th>
          <td>
            {$mediaDesired.video ? "desired" : ""}
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
            {$loadingState}
            {$loaded}/{$maximum}
            <div>(Ent: {$entitiesLoaded}/{$entitiesMaximum})</div>
            <div>(Ast: {$assetsLoaded}/{$assetsMaximum})</div>
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
