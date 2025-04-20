<!-- This component converts the functional UI state machine (raj) to Svelte -->
<script>
import { onMount } from "svelte"
import { SvelteToast } from "@zerodevx/svelte-toast"

import { runtime } from "~/utils/runtime"
import { dir } from "~/i18n"

export let createApp

let programView
let programComponent
let programProps

// Set up locale/language direction (e.g. Arabic is right-to-left)
$: document.dir = $dir

onMount(() => {
  const app = createApp($$props)
  programView = app.view
  const { end } = runtime({
    ...app,
    view: (state, dispatch) => {
      const result = programView(state, dispatch)
      programComponent = result[0]
      if (result[1]) {
        programProps = { ...result[1], dispatch }
      } else {
        programProps = { dispatch }
      }
    },
  })
  return end
})
</script>

<SvelteToast
  options={{
    duration: 5000,
    pausable: true,
    intro: { y: -64 },
  }}
/>

<svelte:component this={programComponent} {...programProps} />
