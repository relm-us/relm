<script lang="ts">
import { _ } from "svelte-i18n"

import Dialog from "~/ui/lib/Dialog"
import AvatarBuilder from "~/ui/AvatarBuilder/AvatarBuilder.svelte"

export let appearance
export let color
</script>

<Dialog
  title={$_("AvatarBuilder.title")}
  align="right"
  tint={false}
  paddingH={32}
  on:cancel
>
  <r-container>
    <AvatarBuilder {...appearance} uniqueColor={color} />
  </r-container>
</Dialog>

<style>
  r-container {
    display: block;
    width: 200px;
  }
</style>
