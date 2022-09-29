<script lang="ts">
  import { locale, locales, _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  import Dialog from "~/ui/lib/Dialog";
  import Button from "../lib/Button";
  import { languageMap } from "~/i18n";

  const dispatch = createEventDispatcher();

  const chooseLanguage = (loc) => () => {
    $locale = loc;
    dispatch("cancel");
  };
</script>

<Dialog title={$_("LanguageDialog.title")} on:cancel>
  <r-locales>
    {#each $locales as loc}
      <Button on:click={chooseLanguage(loc)}>{languageMap[loc] || loc}</Button>
    {/each}
  </r-locales>
</Dialog>

<style>
  r-locales {
    display: flex;
    flex-direction: column;
  }

  r-locales > :global(*) {
    margin: 2px 0;
  }
</style>
