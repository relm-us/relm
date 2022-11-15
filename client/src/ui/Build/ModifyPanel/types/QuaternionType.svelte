<script lang="ts">
  import { Euler, Quaternion } from "three";
  import { createEventDispatcher } from "svelte";

  import Capsule from "~/ui/lib/Capsule";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = {
    x: false,
    y: false,
    z: false,
  };

  const q1: Quaternion = new Quaternion();

  let value: Euler;
  $: value = new Euler(0, 0, 0, "YXZ").setFromQuaternion(component[key]); //component[key]

  function radToDeg(rad) {
    return (rad / Math.PI) * 180;
  }
  function degToRad(deg) {
    return (deg / 180) * Math.PI;
  }

  const onInputChange =
    (dimension) =>
    ({ detail }) => {
      const newValue = degToRad(parseFloat(detail));
      if (!Number.isNaN(newValue)) {
        value[dimension] = newValue;
        q1.setFromEuler(value);
        component[key].copy(q1);

        component.modified();
        dispatch("modified");
        editing[dimension] = false;
      }
    };

  const onInputCancel = (dimension) => (event) => {
    editing[dimension] = false;
  };

  const setNewValue = (dimension, newValue) => {
    const floatValue = parseFloat(newValue);
    value[dimension] = degToRad(floatValue);
    q1.setFromEuler(value);
    component[key].copy(q1);
    component.modified();
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      getValue: () => radToDeg(value[dimension]),
      onDrag: (newValue) => {
        setNewValue(dimension, newValue);
      },
      onChange: (newValue) => {
        setNewValue(dimension, newValue);
        dispatch("modified");
      },
      onClick: () => {
        editing[dimension] = true;
      },
    });
  };

  const draggers = {
    x: makeDragger("x"),
    y: makeDragger("y"),
    z: makeDragger("z"),
  };

  // ignore warning about missing props
  $$props;
</script>

<r-quaternion-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="capsules">
    {#each ["x", "y", "z"] as dim}
      <Capsule
        editing={editing[dim]}
        on:pointerdown={draggers[dim].pointerdown}
        on:change={onInputChange(dim)}
        on:cancel={onInputCancel(dim)}
        label={dim.toUpperCase()}
        value={formatNumber(radToDeg(value[dim]), editing[dim])}
        suffix="°"
        type="number"
      />
    {/each}
  </div>
</r-quaternion-type>

<style>
  div {
    display: flex;
  }
  div.capsules {
    margin-top: 4px;
    margin-bottom: 6px;
    justify-content: space-around;
  }
</style>
