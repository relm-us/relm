<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import NumberInput from "./utils/NumberInput.svelte";

  export let key: string;
  export let component;
  export let prop;
  export let attrs: { labels?: string[] } = {};

  const dispatch = createEventDispatcher();

  const onValueChanged =
    (dim) =>
    ({ detail }) => {
      component[key][dim] = detail.value;
      component.modified();
      if (detail.final) {
        dispatch("modified");
      }
    };

  function getLabel(i, defaultLabel) {
    let label = defaultLabel;
    if (attrs.labels) label = attrs.labels[i];
    return label ? label.toUpperCase() : label;
  }

  let fields;
  // Create a set of 2 or 3 fields, e.g. X, Y, and Z. These fields may optionally
  // be re-labeled, based on parameters passed by `attrs.labels`.
  // NOTE: We re-purpose Vector3Type for Vector2Type as well, to avoid redundancy.
  $: fields = (prop.type.name === "Vector2" ? ["x", "y"] : ["x", "y", "z"]).map(
    (dim, i) => ({
      dim,
      label: getLabel(i, dim),
    })
  );

  // ignore warning about missing props
  $$props;
</script>

<r-vector3-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="capsules">
    {#each fields as field}
      {#if field.label}
        <NumberInput
          label={field.label}
          value={component[key][field.dim]}
          on:value={onValueChanged(field.dim)}
        />
      {/if}
    {/each}
  </div>
</r-vector3-type>

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
