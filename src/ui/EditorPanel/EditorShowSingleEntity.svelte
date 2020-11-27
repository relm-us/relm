<script lang="ts">
  import { onMount } from "svelte";

  import Button from "~/ui/Button";
  import ComponentPane from "./ComponentPane.svelte";
  import EntityDetails from "./EntityDetails.svelte";
  import { worldManager } from "~/stores/worldManager";

  export let entity;

  let primaryComponents, secondaryComponents;
  $: primaryComponents = entity && entity.Components.filter((c) => c.editor);
  $: secondaryComponents = entity && entity.Components.filter((c) => !c.editor);

  let secondaryComponentsVisible = false;

  let active = entity.active;

  const destroyComponent = (entity, Component) => {
    entity.remove(Component);
  };

  const detectInactive = (emitEntity) => {
    if (emitEntity.id === entity.id) {
      active = false;
    }
  };

  const detectActive = (emitEntity) => {
    if (emitEntity.id === entity.id) {
      active = true;
    }
  };

  const saveEntity = (entity) => () => {
    console.log("saveEntity", entity);
    $worldManager.wdoc.syncFrom(entity);
  };

  onMount(() => {
    $worldManager.world.on("entity-inactive", detectInactive);
    $worldManager.world.on("entity-active", detectActive);

    return () => {
      $worldManager.world.off("entity-inactive", detectInactive);
      $worldManager.world.off("entity-active", detectActive);
    };
  });
</script>

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>

<EntityDetails {entity} {active} />

{#if active}
  <!-- Components meant to be edited -->
  {#each primaryComponents as Component (Component)}
    <ComponentPane
      {Component}
      component={entity.components.get(Component)}
      on:destroy={() => destroyComponent(entity, Component)}
      on:modified={saveEntity(entity)} />
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
          on:destroy={() => destroyComponent(entity, Component)}
          on:modified={saveEntity(entity)} />
      {/each}
    {/if}
  {/if}
{:else}
  <info>Entity Deactivated</info>
{/if}
