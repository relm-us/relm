<script lang="ts">
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import debounce from "lodash/debounce";

  import Dialog from "~/ui/lib/Dialog";
  import Button from "../lib/Button";

  import TextInput from "~/ui/lib/TextInput";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { worldManager } from "~/world";
  import { permits } from "~/stores/permits";

  const dispatch = createEventDispatcher();

  let withEditPermission = false;
  let withInvitePermission = false;
  let maxUses = 20;

  let inviteUrl = "";

  $: withEditPermission, withInvitePermission, setInviteUrl();

  const resetInviteUrl = () => {
    inviteUrl = "";
    debouncedSetInviteUrl();
  };

  const setInviteUrl = () => {
    worldManager.api
      .makeInvitation({ withEditPermission, withInvitePermission, maxUses })
      .then(({ url }) => {
        inviteUrl = url;
      });
  };

  const debouncedSetInviteUrl = debounce(setInviteUrl, 1000);

  function selectUrl(event) {
    event.currentTarget.select();
  }
</script>

<Dialog title={$_("InviteDialog.title")} on:cancel>
  <r-column>
    <div>
      <input
        value={inviteUrl}
        placeholder={$_("InviteDialog.loading")}
        on:focus={selectUrl}
      />
    </div>
    {#if $permits.includes("edit")}
      <r-row>
        <span>{$_("InviteDialog.allow_build_mode")}</span>
        <ToggleSwitch
          bind:enabled={withEditPermission}
          labelOn="Yes"
          labelOff="No"
        />
      </r-row>
    {/if}
    {#if $permits.includes("invite")}
      <r-row>
        <span>{$_("InviteDialog.allow_inviting")}</span>
        <ToggleSwitch
          bind:enabled={withInvitePermission}
          labelOn="Yes"
          labelOff="No"
        />
      </r-row>
    {/if}
    <r-row>
      <span>{$_("InviteDialog.max_uses")}</span>
      <r-number-input>
        <TextInput bind:value={maxUses} on:keydown={resetInviteUrl} />
      </r-number-input>
    </r-row>

    <r-button-row>
      <Button on:click={() => dispatch("cancel")}>
        {$_("InviteDialog.close")}
      </Button>
    </r-button-row>
  </r-column>
</Dialog>

<style>
  r-column {
    display: flex;
    flex-direction: column;
    align-items: center;

    color: var(--foreground-white, white);
  }

  r-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    align-self: flex-end;
    margin-bottom: 8px;

    font-size: 11px;
  }

  r-row :global(lbl) {
    color: var(--selected-red, red);
  }

  r-row :global(.enabled lbl) {
    color: var(--foreground-white, white);
  }

  r-row > span {
    display: block;
    margin-right: 12px;
  }

  r-number-input {
    display: block;
    width: 48px;
  }

  input {
    width: 280px;
    margin: 16px 0;
    border-radius: 8px;
    border: 0;
    padding: 4px 8px;
    line-height: 28px;
    text-align: center;
  }

  r-button-row {
    display: block;
    margin-top: 16px;
  }
</style>
