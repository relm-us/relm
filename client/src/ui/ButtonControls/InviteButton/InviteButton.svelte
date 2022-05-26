<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoIosMailOpen from "svelte-icons/io/IoIosMailOpen.svelte";
  import InvitationPane from "./InvitationPane.svelte";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let permits;

  let showInvitationPane = false;

  function onClick() {
    showInvitationPane = true;
  }
</script>

<CircleButton on:click={onClick} padding={0} Icon={IoIosMailOpen} />

{#if showInvitationPane}
  <Fullwindow on:close={() => (showInvitationPane = false)}>
    <r-container>
      <InvitationPane {permits} />
    </r-container>
  </Fullwindow>
{/if}

<style>
  r-container {
    display: flex;
    position: absolute;
    pointer-events: none;
    bottom: 74px;
    justify-content: center;
    width: 100%;
  }

  r-container > :global(*) {
    pointer-events: all;
  }
</style>
