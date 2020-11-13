<script lang="ts">
  import Vector3Type from "./types/Vector3Type.svelte";
  import QuaternionType from "./types/QuaternionType.svelte";
  import RefType from "./types/RefType.svelte";
  import StringType from "./types/StringType.svelte";
  import NumberType from "./types/NumberType.svelte";
  import JSONType from "./types/JSONType.svelte";
  import MiscType from "./types/MiscType.svelte";

  export let key;
  export let value;
  export let prop;

  const Type = getTypeComponent(prop.type.name);

  function getTypeComponent(propType) {
    switch (propType) {
      case "Vector3":
        return Vector3Type;
      case "Quaternion":
        return QuaternionType;
      case "Ref":
        return RefType;
      case "String":
        return StringType;
      case "Number":
        return NumberType;
      case "JSON":
        return JSONType;
      default:
        return MiscType;
    }
  }
</script>

<style>
  div {
    margin-top: 4px;
    margin-bottom: 2px;
  }
</style>

{#if typeof Type === 'string'}
  {Type}
{:else}
  <div>
    <svelte:component this={Type} {key} {value} {prop} />
  </div>
{/if}
