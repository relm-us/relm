<script lang="ts">
import IoMdClose from "svelte-icons/io/IoMdClose.svelte"
import { cleanHtml } from "~/utils/cleanHtml"

export let content
export let hanchor
export let onClose
export let visible

function close() {
  visible = false
  onClose?.()
}

// ignore warning about missing props
$$props
</script>

{#if visible}
  <div class="bubble" class:right={hanchor === 2} class:left={hanchor === 1}>
    <span>{@html cleanHtml(content)}</span>
    {#if onClose}
      <div class="outline" />
      <button class="close" on:click={close}>
        <div>
          <IoMdClose />
        </div>
      </button>
    {/if}
  </div>
{/if}

<style lang="scss">
  .bubble {
    display: inline-block;
    pointer-events: auto;

    position: relative;
    padding: 15px 20px;
    border-radius: 10px;
    border: 2px solid black;
    background: white;
    clear: both;
    width: 150px;

    color: var(--background-gray);
    text-align: center;

    span {
      display: inline-block;
      vertical-align: top;
      text-align: left;
    }

    &:before {
      content: "";
      position: absolute;
      bottom: -49.5px;
      height: 50px;
      width: 90px;
    }

    &.left {
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

  button.close {
    all: unset;

    position: absolute;
    top: -5px;
    right: -5px;

    display: block;
    width: 24px;
    height: 24px;

    color: var(--foreground-gray);
    background-color: white;
    border-radius: 100%;
  }
  button.close > div {
    padding: 3px;
  }

  .outline {
    position: absolute;
    z-index: -1;
    top: -7px;
    right: -7px;
    width: 28px;
    height: 28px;
    border-radius: 100%;
    background-color: black;
  }

  button:hover {
    color: #555;
  }
</style>
