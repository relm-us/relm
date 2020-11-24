<script lang="ts">
  import Button from "../Button";
  import { worldManager } from "~/stores/worldManager";
  import { yConnectStatus } from "~/stores/connectStatus";

  const onClick = () => {
    if ($yConnectStatus === "disconnected") {
      $worldManager.connect();
    } else if ($yConnectStatus === "connected") {
      $worldManager.disconnect();
    }
  };
</script>

<Button on:click={onClick}>
  {#if $yConnectStatus === 'disconnected'}
    Connect
  {:else if $yConnectStatus === 'connecting'}
    (connecting...)
  {:else if $yConnectStatus === 'connected'}Disconnect{/if}
</Button>
