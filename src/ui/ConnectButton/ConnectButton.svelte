<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";
  import { yConnectStatus, relmId } from "~/stores/connection";
  import Pane from "./Pane.svelte";

  let inputEl;
  let subtitle;
  let minimized = false;

  const getSubtitle = (status, relmId) => {
    // prettier-ignore
    switch (status) {
      case 'connected':    return `connected (${relmId})`
      case 'connecting':   return `connecting...`
      case 'disconnected': return `disconnected`
    }
  };

  $: subtitle = getSubtitle($yConnectStatus, $relmId);

  const onClickConnect = () => {
    $relmId = inputEl.value;
    $worldManager.connect();
    minimized = true;
  };

  const onClickDisconnect = () => {
    $worldManager.disconnect();
  };
</script>

<style>
  div {
    min-width: 200px;
    display: flex;
    --pane-width: 180px;
  }
  label {
    display: block;
    margin: 8px 16px 4px 16px;
  }
  input {
    margin: 4px 16px 8px 16px;
    width: 148px;
    border: none;
    border-radius: 3px;
    line-height: 32px;
    font-size: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 1);

    background-color: rgba(0, 0, 0, 0.25);
    color: rgba(240, 240, 240, 1);

    pointer-events: all;
  }
  buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
</style>

<div>
  <Pane title="Network" {subtitle} showMinimize={true} bind:minimized>
    {#if $yConnectStatus === 'connected'}
      <buttons>
        <Button on:click={onClickDisconnect}>Disconnect</Button>
      </buttons>
    {:else if $yConnectStatus === 'disconnected'}
      <label for="relmId">Relm:</label>
      <input bind:this={inputEl} type="text" name="relmId" value={$relmId} />
      <buttons>
        <Button on:click={onClickConnect}>Connect</Button>
      </buttons>
    {/if}
  </Pane>
</div>
