<script lang="ts">
import BlankWithLogo from "./BlankWithLogo.svelte"

export let message

$$props
</script>

<BlankWithLogo>
  {#if message}
    <div>{message}</div>
  {/if}
</BlankWithLogo>

<style>
  div {
    text-align: center;
  }
</style>
