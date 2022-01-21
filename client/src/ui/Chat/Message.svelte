<script lang="ts">
  import type { IdentityData } from "~/identity/types";
  import { cleanHtml } from "~/utils/cleanHtml";

  export let identity: IdentityData;
  export let content: string;

</script>

{#if identity}
  <message>
    <id-circle style="background-color:{identity.color}" />
    <container>
      <who>{identity.name}</who>
      <content>{@html cleanHtml(content)}</content>
    </container>
  </message>
{:else}
  <message>Loading...</message>
{/if}

<style>
  message {
    color: #333;
    background-color: #eee;

    border-radius: 9px 9px 9px 0;

    padding: 6px 10px;
    margin: 3px;
  }

  message :global(a),
  message :global(a:visited) {
    color: cornflowerblue;
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
    float: right;

    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-radius: 100%;
    margin-left: 0px;
    margin-right: 0px;
  }

</style>
