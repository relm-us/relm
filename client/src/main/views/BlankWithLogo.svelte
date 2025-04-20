<script lang="ts">
import { config } from "~/config"
import PageOverlay from "~/ui/lib/PageOverlay"
$$props
</script>

<PageOverlay>
  <r-column>
    <div class="logo"><img src={config.logoUrl} alt="logo" width="250" /></div>
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
  .logo {
    text-align: center;
  }
</style>
