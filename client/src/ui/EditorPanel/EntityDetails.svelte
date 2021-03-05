<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Select from "svelte-select";

  import { RigidBodyRef } from "~/ecs/plugins/rapier";

  import Capsule from "~/ui/Capsule";
  import Button from "~/ui/Button";
  import { Relm } from "~/stores/Relm";
  import { sortAlphabetically } from "~/utils/sortAlphabetically";

  export let entity;

  const dispatch = createEventDispatcher();

  let componentOptions;
  $: componentOptions = getComponents($Relm, entity);

  let selectedValue;

  const getComponents = (worldManager, entity) => {
    const entityComponentNames = entity.Components.map((c) => c.name);
    const components = Object.entries(
      worldManager.world.components.componentsByName
    )
      .filter(([componentName, fn]) => {
        const Component = fn as any;
        return (
          !Component.isLocalComponent &&
          !Component.isStateComponent &&
          !entityComponentNames.includes(componentName)
        );
      })
      .map(([componentName, fn]) => ({
        label: componentName,
        value: (fn as any).name,
      }));
    sortAlphabetically(components, (c) => c.label);
    return components;
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
    const componentName = detail.value;
    setTimeout(() => {
      entity.addByName(componentName);
      $Relm.wdoc.syncFrom(entity);
      dispatch("modified");

      componentOptions = getComponents($Relm, entity);
      selectedValue = undefined;
    }, 300);
  };
</script>

<div>
  <info>
    <Capsule editable={false} label="ID" value={entity.id} />
    <Capsule label="Name" value={entity.name} />
  </info>
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
      bind:selectedValue
      placeholder="Add Component..."
      isClearable={false}
      items={componentOptions}
      on:select={onSelectNewComponent}
    />
  </select-container>
</div>

<style>
  div {
    width: 268px;
    margin: 8px 16px;
  }
  info {
    display: flex;
    flex-wrap: wrap;
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
    --inputLeft: 0;
    --inputPadding: 0px 0px 0px 16px;
  }
</style>
