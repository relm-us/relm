<script lang="ts">
  import { onMount } from "svelte";

  import LeftPanel, { Header, Pane } from "~/ui/LeftPanel";
  import Button from "~/ui/Button";
  import ComponentPane from "./ComponentPane.svelte";
  import { hovered, selectedEntities, selectedGroups } from "~/world/selection";

  const UPDATE_FREQUENCY_MS = 100;

  export let world;

  function getEntity(selected) {
    return (
      selected.size && world.entities.getById(selected.values().next().value)
    );
  }

  let entity;
  // update everything whenever the selection changes
  $: entity = getEntity($selectedEntities);

  let primaryComponents, secondaryComponents;
  $: primaryComponents = entity && entity.Components.filter((c) => c.editor);
  $: secondaryComponents = entity && entity.Components.filter((c) => !c.editor);

  let secondaryComponentsVisible = false;

  const refresh = () => {
    entity = getEntity($selectedEntities);
  };

  const destroyComponent = (entity, Component) => {
    console.log("destroyComponent", entity.id, Component);
    entity.remove(Component);
    refresh();
  };

  // Regularly update our panel data
  onMount(() => {
    const interval = setInterval(() => refresh(), UPDATE_FREQUENCY_MS);

    return () => clearInterval(interval);
  });
</script>

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>

<LeftPanel>
  <Header>Editor</Header>
  {#if $selectedEntities.size === 0}
    <info>Nothing selected</info>
  {:else if $selectedEntities.size === 1}
    <!-- Components meant to be edited -->
    {#each primaryComponents as Component (Component)}
      <ComponentPane
        {Component}
        component={entity.components.get(Component)}
        on:destroy={() => destroyComponent(entity, Component)} />
    {/each}

    <!-- Internal Components -->
    {#if secondaryComponents.length}
      <Button
        style="margin-top:8px"
        on:click={() => {
          secondaryComponentsVisible = !secondaryComponentsVisible;
        }}>
        {secondaryComponentsVisible ? 'Hide' : 'Show'}
        ({secondaryComponents.length}) Internal Components
      </Button>
      {#if secondaryComponentsVisible}
        {#each secondaryComponents as Component (Component)}
          <ComponentPane
            {Component}
            component={entity.components.get(Component)}
            on:destroy={() => destroyComponent(entity, Component)} />
        {/each}
      {/if}
    {/if}
  {:else}
    <Pane title="Selected">
      {#each [...$selectedEntities] as entityId}
        <div>{entityId}</div>
      {/each}
      {#each [...$selectedGroups] as groupId}
        <div>{groupId}</div>
      {/each}
    </Pane>
    <Pane title="Hovered">
      {#each [...$hovered] as entityId}
        <div>{entityId}</div>
      {/each}
    </Pane>
  {/if}
</LeftPanel>
