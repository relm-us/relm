<script lang="ts">
  import {
    selectedEntities,
    selectedGroups,
    groupTree,
  } from "~/stores/selection";

  import Button from "~/ui/lib/Button";
  import { _ } from "~/i18n";

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
  {#if action === "group"}{$_("GroupUngroupButton.group")}{:else}{$_(
      "GroupUngroupButton.ungroup"
    )}{/if}
</Button>
