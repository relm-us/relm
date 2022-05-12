<script lang="ts">
  import { Vector2 } from "three";
  import { worldUIMode } from "~/stores/worldUIMode";
  import QuillOverlay from "./QuillOverlay.svelte";

  import QuillPage from "./QuillPage.svelte";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { hasAncestor } from "~/utils/hasAncestor";

  export let docId: string;
  export let bgColor: string;
  export let editable: boolean;
  export let visible: boolean;
  export let kind: string;
  export let radius: number;
  export let size: Vector2;

  let editor = null;
  let toolbar = null;
  let bigscreen = false;

  $: if (editor) editor.enable(editable && bigscreen);

  const activate = () => (bigscreen = true);
  const deactivate = () => (bigscreen = false);

  function onClick(event) {
    if (
      hasAncestor(event.target, editor.root) ||
      hasAncestor(event.target, toolbar)
    ) {
      console.log("editor clicked");
    } else {
      deactivate();
    }
  }

  // ignore warning about missing props
  $$props;
</script>

{#if bigscreen}
  <Fullwindow on:click={onClick}>
    <r-centered>
      <r-page-margin
        style="--x:{size.x}px;--y:{size.y}px;--radius:{radius * 150}px"
        class:rounded={kind === "ROUNDED"}
        class:circle={kind === "CIRCLE"}
      >
        <QuillPage
          {docId}
          {bgColor}
          bind:editor
          bind:toolbar
          readOnly={!editable}
          showToolbar={editable}
        />
      </r-page-margin>
    </r-centered>
  </Fullwindow>
{/if}

<QuillPage {docId} {bgColor} bind:editor readOnly={true} showToolbar={false}>
  {#if $worldUIMode === "play"}
    <QuillOverlay cloudy={false} on:click={activate} />
  {:else if $worldUIMode === "build"}
    <QuillOverlay cloudy={true} />
  {/if}
</QuillPage>

<style>
  r-centered {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 12px;
  }

  r-page-margin {
    display: block;
    width: var(--x);
    height: var(--y);
  }

  .rounded {
    border-radius: var(--radius);
    overflow: hidden;
  }

  .circle {
    border-radius: 100%;
    overflow: hidden;
  }
</style>
