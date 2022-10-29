<script lang="ts">
  import { IconAudioEnabled, IconAudioDisabled } from "./icons/index";

  export let enabled = true;
</script>

{#if enabled}
  <IconAudioEnabled class={$$props.class} />
{:else}
  <IconAudioDisabled class={$$props.class} />
{/if}
