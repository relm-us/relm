<script>
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { worldManager } from "~/world";
import SignInTextInput from "./components/SignInTextInput.svelte";

  export let enabled;

  function onClick() {
    worldManager.logout();
    enabled = false;
  }

</script>

<Fullwindow>
  <r-background></r-background>
  <r-window>
    <r-content>
      <SignInTextInput type="email" label="EMAIL" />
    </r-content>
  </r-window>
</Fullwindow>

<style>
  r-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    background: #000000;
    opacity: 0.7;
  }

  r-window {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-content {
    display: flex;
    justify-content: center;
    width: 25%;
    height: 100%;
    padding-top: 25vh;
  }
</style>