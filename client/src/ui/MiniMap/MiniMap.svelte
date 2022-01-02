<script lang="ts">
  import { Vector3 } from "three";
  import { onMount } from "svelte";
  import { worldManager } from "~/world";
  import MapParticipant from "./MapParticipant.svelte";

  import CircleButton from "~/ui/lib/CircleButton";
  import FaMap from "svelte-icons/fa/FaMap.svelte";

  let center = new Vector3();
  worldManager.boundingBox.getCenter(center);

  let size = new Vector3();
  worldManager.boundingBox.getSize(size);

  let enabled = true;

  let mapDiameter = 150;
  let worldDiameter = size.x > size.z ? size.x : size.z;
  let otherPositions = [];
  let myPosition = null;

  onMount(() => {
    const interval = setInterval(() => {
      otherPositions = worldManager.identities.active.map((identity) => {
        return identity.avatar.position;
      });
      myPosition = worldManager.identities.me.avatar.position;
    }, 75);
    return () => clearInterval(interval);
  });
</script>

{#if enabled}
  <r-mini-map on:click={() => (enabled = false)}>
    <r-centered>
      {#each otherPositions as pos}
        <MapParticipant
          x={((pos.x - center.x) * mapDiameter) / worldDiameter}
          y={((pos.z - center.z) * mapDiameter) / worldDiameter}
        />
      {/each}
      {#if myPosition}
        <MapParticipant
          color="#f0d909"
          x={((myPosition.x - center.x) * mapDiameter) / worldDiameter}
          y={((myPosition.z - center.z) * mapDiameter) / worldDiameter}
        />
      {/if}
    </r-centered>
  </r-mini-map>
{:else}
  <r-ui>
    <CircleButton on:click={() => (enabled = true)}>
      <icon><FaMap /></icon>
    </CircleButton>
  </r-ui>
{/if}

<style>
  r-mini-map {
    display: block;
    position: absolute;
    z-index: 1;
    left: 12px;
    bottom: 12px;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    border-left: 1px solid #aaa;
    border-right: 1px solid #111;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #222;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));
    overflow: hidden;
  }
  r-centered {
    position: relative;
    left: 50%;
    top: 50%;
  }
  r-ui {
    display: block;
    position: absolute;
    z-index: 1;
    left: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }
  icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>
