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

  let isActive;
  $: isActive = checkActive(entity, Component.name);

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
      if (property === undefined) return acc;

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
      if (
        (item.value !== undefined && component[item.prop] === item.value) ||
        item.value === undefined
      ) {
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

  function canDestroy() {
    return !["Transform"].includes(Component.name);
  }

  // If a Component has a corresponding Activator Component, return it
  function getActivator(entity, componentName) {
    return entity.world.components.activators[componentName];
  }

  function canActivate(entity, componentName) {
    return Boolean(getActivator(entity, componentName));
  }

  function checkActive(entity, componentName) {
    const Activator = getActivator(entity, componentName);
    return entity.components.has(Activator);
  }

  function activate(entity, componentName) {
    const Activator = getActivator(entity, componentName);
    entity.add(Activator);
    isActive = true;
    onModified();
  }

  function deactivate(entity, componentName) {
    const Activator = getActivator(entity, componentName);
    entity.maybeRemove(Activator);
    isActive = false;
    onModified();
  }

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
  showActivate={canActivate(entity, Component.name)}
  {isActive}
  on:close={() => dispatch("destroy")}
  on:activate={() => activate(entity, Component.name)}
  on:deactivate={() => deactivate(entity, Component.name)}
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
