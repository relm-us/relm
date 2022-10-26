<script lang="ts">
  import Dialog from "~/ui/lib/Dialog";
  import Background from "./components/Background.svelte";
</script>

<Background />

<Dialog title="Dashboard" canCancel={false} tint={false}>
  <!-- {#each relms as relm}{/each} -->
  <r-relms> Relms go here </r-relms>
</Dialog>

<style>
  r-relms {
    display: block;
    color: white;
  }
</style>
