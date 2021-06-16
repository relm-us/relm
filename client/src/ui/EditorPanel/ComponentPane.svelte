<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  import { Pane } from "~/ui/LeftPanel";
  import Capsule from "~/ui/lib/Capsule";
  import Property from "./Property.svelte";

  export let Component;
  export let component;
  export let entity;

  let toolbarVisible = false;

  const dispatch = createEventDispatcher();

  const propVisible = (prop) => {
    if (prop.editor && prop.editor.requires) {
      // if the `editor.requires` field exists, check if we meet criteria
      return prop.editor.requires.reduce((acc, item) => {
        return acc && component[item.prop] === item.value;
      }, true);
    } else {
      // by default, all props are shown
      return true;
    }
  };

  const debugComponent = () => {
    (window as any).component = component;
    (window as any).entity = entity;
    console.log(`'window.component' and 'window.entity' available`)
  };
  
  const modifyComponent = () => {
    component.modified();
    dispatch("modified");
  };

  const onModified = () => {
    Component = Component;
    component = component;
    dispatch("modified");
  };

  const onSettings = () => {
    toolbarVisible = !toolbarVisible;
  };

  const canDestroy = () => {
    return !["Transform"].includes(Component.name);
  };

  if (Component.name === "Transform") {
    const UPDATE_FREQUENCY_MS = 100;
    // Regularly update our panel data
    onMount(() => {
      const interval = setInterval(() => {
        component = component;
      }, UPDATE_FREQUENCY_MS);
      return () => clearInterval(interval);
    });
  }
</script>

<Pane
  title={Component.editor ? Component.editor.label : Component.name}
  showClose={canDestroy()}
  showMinimize={true}
  showSettings={true}
  on:close={() => dispatch("destroy")}
  on:settings={onSettings}
>
  {#each Object.entries(Component.props) as [key, prop] (key)}
    {#if propVisible(prop)}
      <Property {key} {component} {prop} on:modified={onModified} />
    {/if}
  {/each}
  {#if toolbarVisible}
    <toolbar>
      <Capsule
        value="Debug"
        editable={false}
        on:mousedown={debugComponent}
        cursor="pointer"
      />
      <Capsule
        value="Modified"
        editable={false}
        on:mousedown={modifyComponent}
        cursor="pointer"
      />
    </toolbar>
  {/if}
</Pane>

<style>
  toolbar {
    display: flex;
    margin: 8px 16px 8px 16px;
    padding-top: 8px;
    border-top: 1px solid #555;
  }
</style>
