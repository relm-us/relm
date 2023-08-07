<script lang="ts">
  import type { Entity } from "~/ecs/base";
  import type { Asset } from "~/ecs/plugins/core";

  import { fade } from "svelte/transition";
  import Video from "~/av/components/Video";

  import { assetUrl } from "~/config/assetUrl";
  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import Button from "~/ui/lib/Button";
  import { Projector } from "./Projector";
  import { participantId as myParticipantId } from "~/identity/participantId";
  import { worldManager } from "~/world";
  import { get } from "svelte/store";

  export let participantId;
  export let iAmNear: boolean = false;
  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";
  export let visible: boolean;
  export let entity: Entity;

  let bigscreen = false;
  let videoTrack;

  const activate = () => {
    if (pointerStateDelayed !== "interactive-drag") bigscreen = true;
  };
  const deactivate = () => (bigscreen = false);

  $: if ($worldUIMode === "build") {
    bigscreen = false;
  }

  function publishParticipantId(participantId) {
    const projector: Projector = entity.get(Projector);
    projector.participantId = participantId;
    projector.modified();
    worldManager.worldDoc.syncFrom(entity);
  }

  function onShare() {
    if (participantId === myParticipantId) {
      publishParticipantId(null);
    } else {
      publishParticipantId(myParticipantId);
    }
  }

  $: if (participantId && worldManager.avConnection) {
    videoTrack = get(
      worldManager.avConnection.getTrackStore(participantId, "video")
    );
  } else {
    videoTrack = null;
  }

  // ignore other props
  $$props;
</script>

{#if visible}
  {#if bigscreen}
    <Fullwindow on:click={deactivate} on:close={deactivate}>
      <r-fullwindow-image transition:fade>
        {#if videoTrack}
          <Video track={videoTrack} />
        {:else}
          <img
            class:cover={fit === "COVER"}
            class:contain={fit === "CONTAIN"}
            src={assetUrl(asset.url)}
            alt={asset.name === "" ? "Screenshare" : asset.name}
            on:click={$worldUIMode === "build" ? undefined : activate}
            on:mousedown|preventDefault
          />
        {/if}
      </r-fullwindow-image>
    </Fullwindow>
  {/if}

  <!-- Always show image in its Css3d container -->
  <r-image>
    {#if videoTrack}
      <Video track={videoTrack} />
    {:else}
      <img
        class:cover={fit === "COVER"}
        class:contain={fit === "CONTAIN"}
        src={assetUrl(asset.url)}
        alt={asset.name === "" ? "Screenshare" : asset.name}
        on:click={$worldUIMode === "build" ? undefined : activate}
        on:mousedown|preventDefault
      />
    {/if}
  </r-image>

  {#if iAmNear}
    <r-overlay>
      <r-button-wrap>
        <Button on:click={onShare}>
          {#if participantId === myParticipantId}
            Stop Sharing
          {:else}
            Share My Video
          {/if}
        </Button>
      </r-button-wrap>
    </r-overlay>
  {/if}
{/if}

<style>
  img {
    width: 100%;
    height: 100%;

    /* For `alt` text */
    text-align: center;
  }

  img::before {
    /* For `alt` text */
    line-height: 3em;
    background: white;
    color: black;
    font-size: 28px;
  }

  img.cover {
    object-fit: cover;
  }

  img.contain {
    object-fit: contain;
  }

  r-fullwindow-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-fullwindow-image img {
    width: 90vw;
    height: 90vh;
  }

  r-overlay,
  r-image {
    position: absolute;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    pointer-events: auto;
  }

  r-overlay {
    display: flex;
    justify-content: center;
    align-items: flex-end;

    --bg-color: var(--selected-red, red);
    --fg-color: white;
    --button-border: 2px solid var(--background-gray, black);
  }

  r-button-wrap {
    transform: scale(1.6) translateY(-10px);
    transform-origin: bottom center;
  }

  r-image {
    display: flex;
    justify-content: center;
    align-items: center;

    color: black;
    background: white;
  }
</style>
