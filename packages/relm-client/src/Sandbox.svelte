<script>
  import SortableList from "./SortableList.svelte";

  const favItems = [1, 2].map((i) => ({
    id: `item-${i}`,
    name: `Fav ${i}`,
  }));

  const relmItems = [3].map((i) => ({
    id: `item-${i}`,
    name: `Relm ${i}`,
  }));

  const buildingItems = [4, 5].map((i) => ({
    id: `item-${i}`,
    name: `Building ${i}`,
  }));

  const foliageItems = [6, 7].map((i) => ({
    id: `item-${i}`,
    name: `Foliage ${i}`,
  }));

  const trashItems = [];

  const lists = [
    {
      id: "list-1",
      name: "My Favorites",
      group: "default",
    },
    {
      id: "list-2",
      name: "This Relm",
      group: "default",
    },
    {
      id: "list-3",
      name: "Buildings",
      group: "default",
    },
    {
      id: "list-4",
      name: "Foliage",
      group: "default",
    },
  ];
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    max-width: 220px;
    margin: 16px;
  }
</style>

<div class="container">
  <div>My Favorites</div>
  <SortableList items={favItems} name="favItems" category="fav" />
  <div>This Relm</div>
  <SortableList items={relmItems} name="relmItems" category="relm" />
  <div>Buildings</div>
  <SortableList items={buildingItems} name="buildingItems" category="lib" />
  <div>Foliage</div>
  <SortableList items={foliageItems} name="foliageItems" category="lib" />
  <div>Trash</div>
  <SortableList items={trashItems} name="trashItems" category="trash" />
</div>
