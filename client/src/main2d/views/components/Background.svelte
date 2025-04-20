<script lang="ts">
import { DASHBOARD_BACKGROUND_URL } from "~/config/constants"
</script>

<r-sign-in-screen style="--sign-in-bg: url({DASHBOARD_BACKGROUND_URL})" />

<style>
  r-sign-in-screen {
    display: block;
    width: 100vw;
    height: 100vh;
    background-image: var(--sign-in-bg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
</style>
