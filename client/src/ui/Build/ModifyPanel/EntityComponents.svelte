<script lang="ts">
  import { onMount } from "svelte";

  import Button from "~/ui/lib/Button";
  import ComponentPane from "./ComponentPane.svelte";
  import EntityDetails from "./EntityDetails.svelte";
  import { worldManager } from "~/world";
  import { sortAlphabetically } from "~/utils/sortAlphabetically";
  import { Transform } from "~/ecs/plugins/core";

  import TransformButtons from "./TransformButtons.svelte";
  import { _ } from "~/i18n";

  export let entity;

  type Component = any;

  let primaryComponents: Array<Component>;
  $: {
    primaryComponents = entity.Components.filter(
      (c) => c.editor && c !== Transform
    );
    sortAlphabetically(primaryComponents, (c) => c.editor.label);

    // Always show Transform component first
    primaryComponents.unshift(Transform);
  }

  let secondaryComponents: Array<Component>;
  $: {
    secondaryComponents = entity.Components.filter((c) => !c.editor);
    sortAlphabetically(
      secondaryComponents,
      (c) => c.prototype.constructor.name
    );
  }

  let secondaryComponentsVisible = false;

  let active = entity.active;

  const destroyComponent = (entity, Component) => {
    entity.remove(Component);
    worldManager.worldDoc.syncFrom(entity);
    primaryComponents = primaryComponents;
    secondaryComponents = secondaryComponents;
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
    // console.log("saveEntity", entity);
    worldManager.worldDoc.syncFrom(entity);
  };

  const onModified = () => {
    entity = entity;
    primaryComponents = primaryComponents;
    secondaryComponents = secondaryComponents;
  };

  onMount(() => {
    worldManager.world.on("entity-inactive", detectInactive);
    worldManager.world.on("entity-active", detectActive);

    return () => {
      worldManager.world.off("entity-inactive", detectInactive);
      worldManager.world.off("entity-active", detectActive);
    };
  });
</script>

<EntityDetails {entity} on:modified={onModified} />

{#if active}
  <TransformButtons />

  <!-- Components meant to be edited -->
  {#each primaryComponents as Component (Component)}
    <ComponentPane
      {Component}
      {entity}
      on:destroy={() => destroyComponent(entity, Component)}
      on:modified={saveEntity(entity)}
    />
  {/each}

  <!-- Internal Components -->
  {#if secondaryComponents.length}
    <Button
      style="margin-top:8px"
      on:click={() => {
        secondaryComponentsVisible = !secondaryComponentsVisible;
      }}
    >
      {secondaryComponentsVisible ? "Hide" : "Show"}
      ({secondaryComponents.length}) {$_(
        "EntityComponents.internal_components"
      )}
    </Button>
    {#if secondaryComponentsVisible}
      {#each secondaryComponents as Component (Component)}
        <ComponentPane
          {Component}
          {entity}
          on:destroy={() => destroyComponent(entity, Component)}
          on:modified={saveEntity(entity)}
        />
      {/each}
    {/if}
  {/if}
{:else}
  <info>{$_("EntityComponents.entity_deactivated")}</info>
{/if}

<style>
  info {
    display: block;
    margin: 32px auto;
  }
</style>
