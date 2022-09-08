<script lang="ts">
  import { locale, locales, _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  import Dialog from "~/ui/lib/Dialog";
  import Button from "../lib/Button";

  const dispatch = createEventDispatcher();

  const chooseLanguage = (loc) => () => {
    $locale = loc;
    dispatch("cancel");
  };
</script>

<Dialog title="Language" on:cancel>
  <r-locales>
    {#each $locales as loc}
      <Button on:click={chooseLanguage(loc)}>{loc}</Button>
    {/each}
  </r-locales>
</Dialog>

<style>
  r-locales > :global(*) {
    margin: 2px 0;
  }
</style>
