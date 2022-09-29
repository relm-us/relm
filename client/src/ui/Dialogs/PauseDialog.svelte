<script>
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "~/ui/lib/Button";
  import Dialog, { Footer } from "~/ui/lib/Dialog";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { autoPause } from "~/stores/autoPause";

  const dispatch = createEventDispatcher();
</script>

<Dialog title={$_("Pause.title")} on:cancel>
  <div class="button">
    <Button on:click={() => dispatch("cancel")}>{$_("Pause.continue")}</Button>
  </div>
  <Footer>
    <div style="padding: 0 16px">
      <ToggleSwitch
        enabled={$autoPause}
        labelOn="Autopause On"
        labelOff="Autopause Off"
        small={true}
        on:change={({ detail }) => ($autoPause = detail)}
      />
    </div>
  </Footer>
</Dialog>
