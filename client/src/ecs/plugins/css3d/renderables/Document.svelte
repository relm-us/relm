<script lang="ts">
  import { Vector2 } from "three";
  import { worldUIMode } from "~/stores/worldUIMode";
  import QuillOverlay from "./QuillOverlay.svelte";

  import QuillPage from "./QuillPage.svelte";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import RatioContainer from "./RatioContainer.svelte";
  import { hasAncestor } from "~/utils/hasAncestor";

  export let docId: string;
  export let bgColor: string;
  export let editable: boolean;
  export let visible: boolean;
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
    <r-info>{size.x / size.y}</r-info>
    <RatioContainer ratio={size.x / size.y}>
      <r-page-margin>
        <QuillPage
          {docId}
          {bgColor}
          bind:editor
          bind:toolbar
          readOnly={!editable}
          showToolbar={editable}
        />
      </r-page-margin>
    </RatioContainer>
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
  r-info {
    display: block;
    position: fixed;
    top: 10px;
    left: 10px;
    font-weight: bold;
  }

  r-page-margin {
    display: block;
    position: absolute;
    top: 60px;
    left: 32px;
    right: 32px;
    bottom: 32px;
  }
</style>
