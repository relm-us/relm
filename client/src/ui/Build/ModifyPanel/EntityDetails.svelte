<script lang="ts">
  import Capsule from "~/ui/lib/Capsule";
  import AddComponent from "./AddComponent.svelte";

  export let entity;
</script>

<r-entity-details>
  <info>
    <Capsule editable={false} label="ID" value={entity.id} maxWidth={false} />
  </info>
  <AddComponent {entity} on:modified />
</r-entity-details>

<style>
  r-entity-details {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    margin: 0px 8px;
  }
</style>
