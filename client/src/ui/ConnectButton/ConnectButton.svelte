<script lang="ts">
  import Button from "../Button";
  import { Relm } from "~/stores/Relm";
  import { subrelm } from "~/stores/subrelm";
  import { yConnectStatus } from "~/stores/connection";
  import Pane from "./Pane.svelte";

  let inputEl;
  let subtitle;
  let minimized = true;

  const getSubtitle = (status, subrelm) => {
    // prettier-ignore
    switch (status) {
      case 'connected':    return `connected (${subrelm})`
      case 'connecting':   return `connecting...`
      case 'disconnected': return `disconnected`
    }
  };

  $: subtitle = getSubtitle($yConnectStatus, $subrelm);

  const onClickConnect = () => {
    // Setting relmId will trigger WorldManager to re-connect
    $subrelm = inputEl.value;
    minimized = true;
  };

  const onClickDisconnect = () => {
    $Relm.disconnect();
  };
</script>

<div class:connected={$yConnectStatus === "connected"}>
  <Pane title="Network" {subtitle} showMinimize={true} bind:minimized>
    {#if $yConnectStatus === "connected"}
      <buttons>
        <Button on:click={onClickDisconnect}>Disconnect</Button>
      </buttons>
    {:else if $yConnectStatus === "disconnected"}
      <label for="relmId">Connect to Relm:</label>
      <input bind:this={inputEl} type="text" name="relmId" value={$subrelm} />
      <buttons>
        <Button on:click={onClickConnect}>Connect</Button>
      </buttons>
    {/if}
  </Pane>
</div>

<style>
  div {
    min-width: 200px;
    display: flex;
    --pane-width: 180px;
  }
  div.connected {
    --subtitle-color: rgba(0, 210, 24, 1);
  }
  label {
    display: block;
    margin: 8px 16px 4px 16px;
    color: rgba(240, 240, 240, 1);
  }
  input {
    margin: 4px 16px 0px 16px;
    padding: 0px 8px 0px 8px;
    width: 148px;
    border: none;
    border-radius: 3px;
    line-height: 32px;
    font-size: 20px;

    background-color: rgba(0, 0, 0, 0.25);
    color: rgba(240, 240, 240, 1);

    pointer-events: all;
  }
  buttons {
    display: flex;
    justify-content: center;
    margin-top: 8px;
    margin-bottom: 8px;
  }
</style>
