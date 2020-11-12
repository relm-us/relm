<script lang="ts">
  import Button from "../Button";
  import {
    selectedEntities,
    selectedGroups,
    groupTree,
  } from "~/world/selection";

  let action = "group";

  const onClick = () => {
    if (action === "group") {
      const groupId = groupTree.makeGroup($selectedEntities);
      selectedGroups.add(groupId);
      action = "ungroup";
    } else {
      for (const groupId of $selectedGroups) {
        groupTree.unmakeGroup(groupId);
      }
      action = "group";
    }
  };

  $: action = $selectedGroups.size === 0 ? "group" : "ungroup";
</script>

<Button on:click={onClick}>
  {#if action === 'group'}Group{:else}Ungroup{/if}
</Button>
