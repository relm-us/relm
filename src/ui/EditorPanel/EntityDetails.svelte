<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { RigidBodyRef } from "~/ecs/plugins/rapier";

  import Capsule from "./Capsule.svelte";

  export let entity;

  const dispatch = createEventDispatcher();

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

  const onDestroy = () => {
    dispatch("destroy");
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
    <Capsule editable={false} label="ID" value={entity.id} />
    <Capsule label="Name" value={entity.name} />
  </row>
  <toolbar>
    <Capsule
      editable={false}
      value="Delete"
      on:mousedown={onDestroy}
      cursor="pointer" />
    {#if hasRigidBody(entity)}
      {#if isSleeping(entity)}
        <Capsule
          editable={false}
          value="Wake"
          on:mousedown={awaken}
          cursor="pointer" />
      {:else}
        <Capsule
          editable={false}
          value="Sleep"
          on:mousedown={asleepen}
          cursor="pointer" />
      {/if}
    {/if}
  </toolbar>
</div>
