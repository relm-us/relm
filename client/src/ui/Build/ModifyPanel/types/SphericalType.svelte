<script lang="ts">
  import { Euler, MathUtils, Quaternion, Spherical } from "three";
  import { createEventDispatcher } from "svelte";

  import Capsule from "~/ui/lib/Capsule";
  import { NumberDragger } from "./utils/NumberDragger";
  import { formatNumber } from "./utils/formatNumber";

  export let key: string;
  export let component;
  export let prop;

  const dispatch = createEventDispatcher();

  let editing = {
    radius: false,
    phi: false,
    theta: false,
  };

  let value: Spherical;
  $: value = new Spherical(
    component[key].radius,
    component[key].phi,
    component[key].theta
  );

  function onRadiusChange({ detail }) {
    setNewValue("radius", parseFloat(detail));
    dispatch("modified");
    editing["radius"] = false;
  }

  const onInputChange =
    (dimension) =>
    ({ detail }) => {
      const newValue = MathUtils.degToRad(parseFloat(detail));
      if (!Number.isNaN(newValue)) {
        setNewValue(dimension, newValue);
        dispatch("modified");
        editing[dimension] = false;
      }
    };

  const onInputCancel = (dimension) => (event) => {
    editing[dimension] = false;
  };

  function setNewValue(dimension, newValue) {
    value[dimension] = newValue;
    component[key].copy(value);
    component.modified();
  }
  const setNewAngleValue = (dimension, newValue) => {
    setNewValue(dimension, MathUtils.degToRad(parseFloat(newValue)));
  };

  const makeDragger = (dimension) => {
    return new NumberDragger({
      scaleFactor: 0.01,
      getValue: () => value[dimension],
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

  const makeAngleDragger = (dimension) => {
    return new NumberDragger({
      scaleFactor: 0.5,
      getValue: () => MathUtils.radToDeg(value[dimension]),
      onDrag: (newValue) => {
        setNewAngleValue(dimension, newValue);
      },
      onChange: (newValue) => {
        setNewAngleValue(dimension, newValue);
        dispatch("modified");
      },
      onClick: () => {
        editing[dimension] = true;
      },
    });
  };

  const draggers = {
    radius: makeDragger("radius"),
    phi: makeAngleDragger("phi"),
    theta: makeAngleDragger("theta"),
  };

  // ignore warning about missing props
  $$props;
</script>

<r-quaternion-type>
  <div>{(prop.editor && prop.editor.label) || key}:</div>
  <div class="capsules">
    <Capsule
      editing={editing["radius"]}
      on:pointerdown={draggers["radius"].pointerdown}
      on:change={onRadiusChange}
      on:cancel={onInputCancel("radius")}
      label="RADIUS"
      value={formatNumber(value["radius"], editing["radius"])}
      type="number"
    />
    {#each ["phi", "theta"] as dim}
      <Capsule
        editing={editing[dim]}
        on:pointerdown={draggers[dim].pointerdown}
        on:change={onInputChange(dim)}
        on:cancel={onInputCancel(dim)}
        label={dim.toUpperCase()}
        value={formatNumber(MathUtils.radToDeg(value[dim]), editing[dim])}
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
    display: flex;
    flex-direction: column;

    gap: 6px;
    margin: 4px 0 6px 6px;
  }
</style>
