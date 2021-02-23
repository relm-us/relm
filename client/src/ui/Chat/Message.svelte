<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { IdentityData } from "~/identity/types";
  import { cleanHtml } from "~/utils/cleanHtml";

  export let who: Readable<IdentityData>;
  export let content: string;
</script>

{#if $who}
  <message>
    <id-circle style="background-color:{$who.shared.color}" />
    <container>
      <who>{$who.shared.name}</who>
      <content>{@html cleanHtml(content)}</content>
    </container>
  </message>
{:else}
  <message>Loading...</message>
{/if}

<style>
  message {
    display: flex;
    align-items: flex-start;

    color: #333;
    background-color: #eee;

    border-radius: 9px 9px 9px 0;

    padding: 6px 10px;
    margin: 3px;
  }

  who {
    font-weight: bold;
  }

  content {
    display: block;
    margin-top: 4px;
  }

  id-circle {
    display: block;
    flex-shrink: 0;

    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-radius: 100%;
    margin-left: 0px;
    margin-right: 8px;
  }
</style>
