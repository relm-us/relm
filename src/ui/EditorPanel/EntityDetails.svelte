<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  import { RigidBodyRef } from "~/ecs/plugins/rapier";

  import Capsule from "./Capsule.svelte";
  import Button from "~/ui/Button";
  import { worldManager } from "~/stores/worldManager";

  export let entity;

  let componentOptions;
  $: componentOptions = getComponents($worldManager, entity);

  const dispatch = createEventDispatcher();

  const getComponents = (worldManager, entity) => {
    const entityComponentNames = entity.Components.map((c) => c.name);
    return Object.entries(worldManager.world.components.componentsByName)
      .filter(([componentName, fn]) => {
        const Component = fn as any;
        return (
          !Component.isLocalComponent &&
          !Component.isStateComponent &&
          !entityComponentNames.includes(componentName)
        );
      })
      .map(([componentName, fn]) => ({ label: componentName, value: fn }));
  };

  function isSleeping(entity) {
    const body = entity.get(RigidBodyRef);
    if (body) {
      return body.value.isSleeping();
    }
  }

  function hasRigidBody(entity) {
    return !!entity.get(RigidBodyRef);
  }

  const awaken = () => {
    const body = entity.get(RigidBodyRef);
    if (body) {
      body.value.wakeUp();
    }
  };
  const asleepen = () => {
    const body = entity.get(RigidBodyRef);
    if (body) {
      body.value.sleep();
    }
  };

  const destroy = () => {
    dispatch("destroy");
  };

  const onSelectNewComponent = ({ detail }) => {
    const Component = detail.value;
    entity.add(Component);
  };
</script>

<style>
  div {
    margin: 8px auto;
  }
  row {
    display: flex;
    justify-content: center;

    margin: 0px 8px;
  }
  toolbar {
    display: flex;
    justify-content: center;

    margin-top: 8px;
    padding-top: 4px;
    --margin: 8px;
    /* border-top: 1px solid #555; */
  }
  select-container {
    display: block;
    margin: 16px 8px 0px 8px;

    --itemColor: #333;
    --background: none;
    --height: 24px;
  }
</style>

<div>
  <row>
    <Capsule editable={false} label="ID" value={entity.id} />
    <Capsule label="Name" value={entity.name} />
  </row>
  <toolbar>
    <Button on:click={destroy}>Delete</Button>
    {#if hasRigidBody(entity)}
      {#if isSleeping(entity)}
        <Button on:click={awaken}>Wake</Button>
      {:else}
        <Button on:click={asleepen}>Sleep</Button>
      {/if}
    {/if}
  </toolbar>
  <select-container>
    <Select
      placeholder="Add Component..."
      isClearable={false}
      items={componentOptions}
      on:select={onSelectNewComponent} />
  </select-container>
</div>
