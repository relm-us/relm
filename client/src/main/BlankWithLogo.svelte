<script lang="ts">
  import PageOverlay from "~/ui/lib/PageOverlay";
  import relmLogo from "~/ui/MediaSetup/relm-logo.png";
  $$props;
</script>

<PageOverlay>
  <r-column>
    <div><img src={relmLogo} alt="logo" width="150" /></div>
    <slot />
  </r-column>
</PageOverlay>

<style>
  r-column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }
</style>
