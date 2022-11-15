<script lang="ts">
  import type { Entity } from "~/ecs/base";
  import type { ComponentClass } from "~/ecs/base/Component";

  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  import Pane from "~/ui/lib/Pane";

  import Property from "./Property.svelte";
  import { Asset } from "~/ecs/plugins/core";

  export let Component: ComponentClass;
  export let entity: Entity;

  let component;
  $: component = entity.components.get(Component);

  const dispatch = createEventDispatcher();

  function propRequires(prop) {
    return prop.editor && prop.editor.requires;
  }

  function propVisible(prop) {
    const reqs = propRequires(prop);

    // by default, all props are shown (no `requires` constraints)
    if (!reqs) {
      // only show properties that have editor attributes
      return Boolean(prop.editor);
    }

    // if the `requires` field exists, check if we meet criteria
    return prop.editor.requires.reduce((acc, item) => {
      if (acc) return acc;

      const property = component && component[item.prop];
      if (!property) return acc;

      if (item.value === undefined) {
        // The prop just needs to exist, it doesn't need to equal a value
        if (property instanceof Asset) {
          return property.url !== "";
        }
        return Boolean(property);
      } else {
        return property === item.value;
      }
    }, false);
  }

  function propAttrs(prop) {
    const reqs = propRequires(prop) || [];

    let attrs = {};
    for (const item of reqs) {
      if (component[item.prop] === item.value) {
        attrs = item;
      }
    }

    return attrs;
  }

  const onModified = () => {
    Component = Component;
    component = component;
    dispatch("modified");
  };

  const canDestroy = () => {
    return !["Transform"].includes(Component.name);
  };

  if (Component.name === "Transform") {
    const UPDATE_FREQUENCY_MS = 400;
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
  on:close={() => dispatch("destroy")}
>
  {#if Component.editor?.description}
    <r-desc>
      {Component.editor.description}
    </r-desc>
  {/if}
  {#each Object.entries(Component.props) as [key, prop] (key)}
    {#if propVisible(prop)}
      <Property
        {key}
        {component}
        {prop}
        {entity}
        attrs={propAttrs(prop)}
        on:modified={onModified}
      />
    {/if}
  {/each}
</Pane>

<style>
  r-desc {
    display: block;

    margin: 8px 4px 8px 0;
    padding-left: 8px;

    color: #999;
    font-size: 10pt;
    border-left: 2px solid #999;
  }
</style>
