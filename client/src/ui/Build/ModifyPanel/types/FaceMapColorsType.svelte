<script lang="ts">
  import type { Component, Entity } from "~/ecs/base";
  import { Color } from "three";

  import { createEventDispatcher } from "svelte";

  import ColorPicker from "~/ui/lib/ColorPicker";
  import { Model2Ref } from "~/ecs/plugins/form";
  import { getFacemapNames } from "~/ecs/plugins/coloration/getFacemapNames";
  import Slider from "~/ui/lib/Slider";

  export let key: string;
  export let component: Component;
  export let entity: Entity;
  export let prop;

  const dispatch = createEventDispatcher();

  function getAllFacemapNames(): string[] {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return [];

    let facemapNames = new Set<string>();
    scene.traverse((node) => {
      if ((node as any).isMesh) {
        getFacemapNames(node)?.forEach((name) => {
          facemapNames.add(name);
        });
      }
    });

    return Array.from(facemapNames);
  }

  const getFacemapColor = (name: string): string => {
    const pair = component[key][name];
    if (pair) return pair[0];
    else return "#FFFFFF";
  };

  const setFacemapColor =
    (name) =>
    ({ detail }) => {
      const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
      const color = new Color(cssColor);
      const newValue = "#" + color.getHexString();

      if (!(name in component[key])) {
        component[key][name] = [newValue, 0.0];
      } else {
        component[key][name][0] = newValue;
      }

      // Notify ECS system
      component.modified();

      // Dispatch a message that will sync yjs
      dispatch("modified");
    };

  const getFacemapWeight = (name: string): number => {
    const pair = component[key][name];
    if (pair) return pair[1];
    else return 0;
  };

  const setFacemapWeight =
    (name: string, finalize: boolean) =>
    ({ detail: weight }) => {
      if (!(name in component[key])) {
        component[key][name] = ["#FFFFFF", weight];
      } else {
        component[key][name][1] = weight;
      }

      // Notify ECS system
      component.modified();

      // Dispatch a message that will sync yjs
      if (finalize) dispatch("modified");
    };

  let value;
  $: {
    const color = new Color(component[key]);
    value = "#" + color.getHexString();
  }

  // ignore warning about missing props
  $$props;
</script>

<r-facemap-type>
  <r-label>{(prop.editor && prop.editor.label) || key}:</r-label>

  <r-list>
    {#each getAllFacemapNames() as name}
      <r-row>
        <r-line1>
          <div>{name}</div>
        </r-line1>
        <r-line2>
          <div style="width: 100%">
            <Slider
              value={getFacemapWeight(name)}
              on:change={setFacemapWeight(name, false)}
              on:end={setFacemapWeight(name, true)}
            />
          </div>
          <ColorPicker
            value={getFacemapColor(name)}
            enableSwatches={true}
            enableAlpha={false}
            enableFormat={true}
            open={false}
            width="20px"
            height="20px"
            on:change={setFacemapColor(name)}
          />
        </r-line2>
      </r-row>
    {/each}
  </r-list>
</r-facemap-type>

<style>
  r-facemap-type {
    display: block;
  }
  r-label {
    display: block;
    padding-right: 8px;
  }

  r-list {
    display: flex;
    flex-direction: column;
  }

  r-row {
    display: flex;
    flex-direction: column;
    margin: 8px 0;
  }

  r-line1 {
    display: block;
  }

  r-line2 {
    display: flex;
  }
  /* color {
    display: flex;
    align-items: center;
  }
  color-value {
    padding-right: 8px;
    font-family: Consolas, "Liberation Mono", Monaco, "Lucida Console",
      monospace;
    font-size: 12px;
  } */
</style>