<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { onMount } from "svelte";
  import ago from "s-ago";

  import { RelmRestAPI } from "~/main/RelmRestAPI";
  import Dialog from "~/ui/lib/Dialog";
  import Background from "./components/Background.svelte";

  export let api: RelmRestAPI;

  let relms = [];

  function visitRelm(relmPath) {
    window.location.assign(`/${relmPath}`);
  }

  onMount(async () => {
    const result = await api.getMyRelms();

    if (result.status === "error") {
      toast.push(result.reason);
    } else if (result.status === "success") {
      relms = result.relms;
    }
  });
</script>

<Background />

<Dialog title="Dashboard" canCancel={false} tint={false}>
  <r-dashboard>
    <r-title>Relms</r-title>
    {#if relms.length > 0}
      <r-relms>
        {#each relms as relm}
          <button class="r-relm-row" on:click={() => visitRelm(relm.relm_name)}>
            <r-thumb />
            <r-info>
              <r-path>{relm.relm_name}</r-path>
              <r-additional>{ago(new Date(relm.last_visited_at))}</r-additional>
            </r-info>
          </button>
        {/each}
      </r-relms>
    {:else}
      No relms
    {/if}
  </r-dashboard>
</Dialog>

<style>
  r-dashboard {
    display: block;
    color: var(--foreground-white);
    border: 1px solid var(--foreground-dark-gray);
    border-radius: 18px;
    padding: 6px 12px;
  }

  r-title {
    font-size: 16px;
  }
  r-relms {
    display: block;
    min-width: 300px;
  }

  button.r-relm-row {
    display: flex;
    width: 100%;

    margin: 16px 0px;
    padding: 16px 4px;

    border-radius: 8px;
    background-color: #414141;

    border: 0;
    cursor: pointer;
  }

  button.r-relm-row:hover {
    background-color: #555;
  }

  r-thumb {
    display: block;
    width: 32px;
    height: 32px;
    border: 2px solid var(--selected-orange);
    border-radius: 6px;
    margin: 0 10px 0 16px;
  }

  r-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  r-path {
    display: block;
    color: var(--foreground-white);
  }

  r-additional {
    display: block;
    color: var(--foreground-gray);
    font-size: 12px;
  }
</style>
