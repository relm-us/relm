<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  import { Pane } from "~/ui/lib/LeftPanel";

  import Property from "./Property.svelte";

  export let Component;
  export let component;

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
      return acc || component[item.prop] === item.value;
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
  {#each Object.entries(Component.props) as [key, prop] (key)}
    {#if propVisible(prop)}
      <Property
        {key}
        {component}
        {prop}
        attrs={propAttrs(prop)}
        on:modified={onModified}
      />
    {/if}
  {/each}
</Pane>
