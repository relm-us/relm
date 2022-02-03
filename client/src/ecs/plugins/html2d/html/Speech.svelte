<script>
  import { fade } from "svelte/transition";

  import IoMdCloseCircleOutline from "svelte-icons/io/IoMdCloseCircleOutline.svelte";
  import { cleanHtml } from "~/utils/cleanHtml";

  export let content;
  export let hanchor;
  export let onClose;
  export let visible;

  let controlsVisible = true;

  function showControls() {
    controlsVisible = true;
  }

  function hideControls() {
    controlsVisible = false;
  }

  function close() {
    visible = false;
    if (onClose) onClose();
  }

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <div
    tabindex="0"
    class="bubble"
    class:right={hanchor === 2}
    class:left={hanchor === 1}
    on:focus={showControls}
    on:blur={hideControls}
  >
    {@html cleanHtml(content)}
    {#if controlsVisible}
      <controls transition:fade={{ duration: 150 }}>
        <button on:click={close}>
          <IoMdCloseCircleOutline />
        </button>
      </controls>
    {/if}
  </div>
{/if}

<style lang="scss">
  .bubble {
    display: inline-block;

    position: relative;
    padding: 15px 20px;
    border-radius: 10px;
    border: 2px solid black;
    background: white;
    /* font-family: "Permanent Marker"; */
    clear: both;
    min-width: 60px;

    &:before {
      content: "";
      position: absolute;
      bottom: -50px;
      height: 50px;
      width: 90px;
    }

    &.left {
      float: left;
      margin: 0px 100px 50px 0px;
      &:before {
        border-radius: 0 0 100%;
        box-shadow: -2px -2px 0 -0.5px #000 inset, -20px 0px 0px 0px #fff inset,
          -22px -1px 0 0px #000 inset;
        // box-shadow: -2px -2px 0 0 #000 inset, -23px 0 0 0 #fff inset,
        //   -25px -2px 0 0 #000 inset;
        left: 0;
      }
    }
    &.right {
      float: right;
      margin: 0px 0px 50px 100px;
      &:before {
        border-radius: 0 0 0 100%;
        box-shadow: 2px -2px 0 -0.5px #000 inset, 20px 0 0 0 #fff inset,
          22px -1px 0 0 #000 inset;
        right: 0;
      }
    }
    // For "think" and "yell" see https://codepen.io/quatmo/pen/jVoXQe
  }

  controls {
    display: flex;
    flex-direction: column;

    position: absolute;
    top: -17px;
    right: -17px;
    height: calc(100% + 16px);

    --margin: 0;
  }
  button {
    all: unset;
    display: block;
    width: 32px;
    height: 32px;

    color: black;
    background-color: white;
    border-radius: 100%;
  }

  button:hover {
    color: #555;
  }
</style>
