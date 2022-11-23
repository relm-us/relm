<script>
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";
  import { worldManager } from "~/world";

  let upgrading = false;

  function upgradeWorld() {
    if (upgrading) return;

    upgrading = true;

    worldManager.upgradeWorld();

    setTimeout(() => dispatch("cancel"), 1000);
  }

  const dispatch = createEventDispatcher();
</script>

<Dialog title={$_("NeedsMigrationDialog.title")} on:cancel>
  <r-container>
    <p>
      Relm's software has changed since last this world was edited. Please
      upgrade this world.
    </p>
    <p>
      You can skip this step, but you might encounter some issues with build
      mode or play mode interactions.
    </p>
    <div class="buttons">
      <Button on:click={upgradeWorld}>
        {$_("NeedsMigrationDialog.upgrade")}
      </Button>
      <Button
        on:click={() => dispatch("cancel")}
        style="--bg-color: var(--background-gray); --bg-hover-color: #21232A; --fg-color: var(--foreground-gray)"
      >
        {$_("NeedsMigrationDialog.skip")}
      </Button>
    </div>
  </r-container>
</Dialog>

<style>
  r-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    color: var(--foreground-gray);

    max-width: 400px;
  }

  p {
    margin-block-end: 1em;
    margin-block-start: 0em;
  }

  .buttons {
    display: flex;
  }
</style>
