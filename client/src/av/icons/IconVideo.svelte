<script lang="ts">
  import { IconVideoEnabled, IconVideoDisabled } from "./index";

  export let enabled = true;
</script>

{#if enabled}
  <IconVideoEnabled class={$$props.class} />
{:else}
  <IconVideoDisabled class={$$props.class} />
{/if}
