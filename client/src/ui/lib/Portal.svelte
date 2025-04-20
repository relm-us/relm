<script>
import { onMount } from "svelte"

export let target = document.body

let targetEl
let portal
let componentInstance
let mounted = false

onMount(() => {
  if (typeof target === "string") {
    targetEl = document.querySelector(target)
    // Force exit
    if (targetEl === null) {
      return () => {}
    }
  } else if (target instanceof HTMLElement) {
    targetEl = target
  } else {
    throw new TypeError(`Unknown target type: ${typeof target}. Allowed types: String (CSS selector), HTMLElement.`)
  }

  portal = document.createElement("div")
  targetEl.appendChild(portal)
  portal.appendChild(componentInstance)

  // Allow for intro animations after embedding the portal where it goes
  mounted = true

  // TODO: Figure out how to allow outro animations also;
  //       Perhaps something like the following?
  //       https://github.com/sveltejs/svelte/issues/4056#issuecomment-791317426
  //       Maybe `on:outrostart` / `on:outroend` ?

  return () => {
    setTimeout(() => {
      targetEl.removeChild(portal)
    }, 300)
  }
})
</script>

<div bind:this={componentInstance}>
  {#if mounted}
    <slot />
  {/if}
</div>
