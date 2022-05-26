<script lang="ts">
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { worldManager } from "~/world";

  export let permits;

  let withEditPermission = false;
  let withInvitePermission = false;

  let inviteUrl = "";

  $: withEditPermission, withInvitePermission, resetInviteUrl();
  $: worldManager.api
    .makeInvitation({ withEditPermission, withInvitePermission, maxUses: 100 })
    .then(({ url }) => {
      inviteUrl = url;
    });

  function resetInviteUrl() {
    inviteUrl = "";
  }
</script>

<r-invitation-pane>
  <h1>Invitation Link:</h1>
  <div><input value={inviteUrl} placeholder="Loading ..." /></div>
  <r-switches>
    {#if permits.includes("edit")}
      <div>
        <span>Allow Build Mode?</span>
        <ToggleSwitch
          bind:enabled={withEditPermission}
          labelOn="Yes"
          labelOff="No"
        />
      </div>
    {/if}
    {#if permits.includes("invite")}
      <div>
        <span>Allow Inviting?</span>
        <ToggleSwitch
          bind:enabled={withInvitePermission}
          labelOn="Yes"
          labelOff="No"
        />
      </div>
    {/if}
  </r-switches>
</r-invitation-pane>

<style>
  r-invitation-pane {
    display: flex;
    flex-direction: column;
    background: var(--background-transparent-gray, black);
    border-radius: 5px;
    padding: 20px;
    color: var(--foreground-white, white);
  }

  h1 {
    margin: 4px 0;
    font-size: 18px;
  }

  r-switches {
    display: flex;
    flex-direction: column;
  }

  r-switches :global(lbl) {
    color: var(--selected-red, red);
  }
  r-switches :global(.enabled lbl) {
    color: var(--foreground-white, white);
  }

  r-switches > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  r-switches > div > * {
    display: block;
    margin-right: 12px;
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
</style>
