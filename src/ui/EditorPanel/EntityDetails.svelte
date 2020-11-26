<script lang="ts">
  import { RigidBody, RigidBodyRef } from "~/ecs/plugins/rapier";

  import Capsule from "./Capsule.svelte";

  export let entity;
  export let active;

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

  const onActivate = () => {
    entity.activate();
    awaken();
  };
  const onDeactivate = () => {
    entity.deactivate();
  };
</script>

<style>
  div {
    margin: 8px 16px;
  }
  row {
    display: flex;
  }
  toolbar {
    display: flex;
    margin-top: 8px;
    padding-top: 4px;
    border-top: 1px solid #555;
  }
</style>

<div>
  <row>
    <Capsule label="ID" value={entity.id} />
    <Capsule label="Name" value={entity.name} />
  </row>
  <toolbar>
    {#if active}
      <Capsule
        value="Deactivate"
        on:mousedown={onDeactivate}
        cursor="pointer" />
    {:else}
      <Capsule value="Activate" on:mousedown={onActivate} cursor="pointer" />
    {/if}
    {#if hasRigidBody(entity)}
      {#if isSleeping(entity)}
        <Capsule value="Wake" on:mousedown={awaken} cursor="pointer" />
      {:else}
        <Capsule value="Sleep" on:mousedown={asleepen} cursor="pointer" />
      {/if}
    {/if}
  </toolbar>
</div>
