<script>
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";
  import { worldManager } from "~/world";

  let upgrading = false;
  let upgraded = false;

  function upgradeWorld() {
    if (upgrading) return;

    upgrading = true;

    worldManager.upgradeWorld();

    setTimeout(() => (upgraded = true), 2000);
  }

  const dispatch = createEventDispatcher();
</script>

<Dialog title={$_("NeedsMigrationDialog.title")} on:cancel>
  <r-container>
    {#if !upgraded}
      <p>{$_("NeedsMigrationDialog.software_changed")}</p>
      <p>{$_("NeedsMigrationDialog.explain_skip")}</p>
      {#if upgrading}
        <p>{$_("NeedsMigrationDialog.upgrading")}</p>
      {/if}
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
    {:else}
      <p>{$_("NeedsMigrationDialog.done_refresh")}</p>
    {/if}
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
