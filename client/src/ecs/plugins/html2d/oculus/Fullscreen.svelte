<script>
import { onMount, createEventDispatcher } from "svelte"
import IoIosClose from "svelte-icons/io/IoIosClose.svelte"

const dispatch = createEventDispatcher()

let el
let fullwindow = false

function handleKeyDown(event) {
  if (fullwindow && event.key === "Escape") {
    dispatch("close")
  }
}

function handleClose() {
  dispatch("close")
}

onMount(async () => {
  // Move fullscreen element to document.body so that "fullwindow" mode can
  // escape absolute/relative positioned elements and take up the whole window.
  document.body.appendChild(el)

  if (document.fullscreenEnabled) {
    el.addEventListener("fullscreenchange", (event) => {
      if (!document.fullscreenElement) {
        // exited full screen
        dispatch("close")
      }
    })

    try {
      await el.requestFullscreen()
    } catch (err) {
      dispatch("close", err)
    }
  } else {
    fullwindow = true
  }
})
</script>

<r-fullscreen bind:this={el} class:fullwindow>
  <slot />
  <r-upper-left-corner>
    <r-icon on:click={handleClose}><IoIosClose /></r-icon>
  </r-upper-left-corner>
</r-fullscreen>

<svelte:window on:keydown={handleKeyDown} />

<style>
  r-fullscreen {
    display: block;
  }

  .fullwindow {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
  }

  r-upper-left-corner {
    position: absolute;
    left: 20px;
    top: 20px;
  }

  r-icon {
    display: block;
    width: 48px;
    height: 48px;
    margin: 0 auto;

    color: white;
  }
  r-icon :global(path) {
    stroke-width: 12px;
    stroke: black;
  }
</style>
