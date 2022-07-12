<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Capsule from "~/ui/lib/Capsule";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;
  export let attrs: { labels?: string[] } = {};

  const dispatch = createEventDispatcher();

  let editing = {
    x: false,
    y: false,
    z: false,
  };

  let labels = [];
  $: if (attrs.labels) {
    labels = attrs.labels;
  } else {
    if (component[key].z === undefined) {
      // Vector2Type
      labels = ["x", "y"];
    } else {
      labels = ["x", "y", "z"];
    }
  }

  let value: { x: number; y: number; z: number };
  $: value = component[key];

  const onInputChange =
    (dimension) =>
    ({ detail }) => {
      const newValue = parseFloat(detail);
      if (!Number.isNaN(newValue) && component[key][dimension] !== newValue) {
        component[key][dimension] = newValue;
        component.modified();
        dispatch("modified");
        editing[dimension] = false;
      }
    };

  const onInputCancel = (dimension) => (event) => {
    editing[dimension] = false;
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => value[dimension],
      onDrag: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
      },
      onChange: (newValue) => {
        component[key][dimension] = newValue;
        component.modified();
        dispatch("modified");
      },
      onClick: () => {
        editing[dimension] = true;
      },
      scaleFactor: 0.01,
    });
  };

  const draggers = {
    x: makeDragger("x"),
    y: makeDragger("y"),
    z: makeDragger("z"),
  };

  const mousemove = (event) => {
    draggers.x.mousemove(event);
    draggers.y.mousemove(event);
    draggers.z.mousemove(event);
  };
  const mouseup = (event) => {
    draggers.x.mouseup(event);
    draggers.y.mouseup(event);
    draggers.z.mouseup(event);
  };
</script>

<r-vector3-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="capsules">
    {#each ["x", "y", "z"].slice(0, labels.length) as dim, i}
      <Capsule
        editing={editing[dim]}
        on:mousedown={draggers[dim].mousedown}
        on:change={onInputChange(dim)}
        on:cancel={onInputCancel(dim)}
        label={labels[i].toUpperCase()}
        value={formatNumber(value[dim], editing[dim])}
        type="number"
      />
    {/each}
  </div>
</r-vector3-type>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />

<style>
  r-vector3-type {
    display: block;
  }
  div.capsules {
    display: flex;
    margin-top: 4px;
    margin-bottom: 6px;
    justify-content: space-around;
  }
  div.capsules > :global(capsule) {
    flex-shrink: 0;
  }
</style>
