<script lang="ts">
  import AssetType from "./types/AssetType.svelte";
  import BooleanType from "./types/BooleanType.svelte";
  import ColorType from "./types/ColorType.svelte";
  import JSONType from "./types/JSONType.svelte";
  import MiscType from "./types/MiscType.svelte";
  import NumberType from "./types/NumberType.svelte";
  import QuaternionType from "./types/QuaternionType.svelte";
  import RefType from "./types/RefType.svelte";
  import SelectType from "./types/SelectType.svelte";
  import StringType from "./types/StringType.svelte";
  import Vector3Type from "./types/Vector3Type.svelte";
  import Vector2Type from "./types/Vector2Type.svelte";

  export let key;
  export let component;
  export let prop;

  const Type = getTypeComponent(prop.editor?.input || prop.type.name);

  function getTypeComponent(propType) {
    switch (propType) {
      case "Asset":
        return AssetType;
      case "Boolean":
        return BooleanType;
      case "Color":
        return ColorType;
      case "Entity":
        return StringType;
      case "JSON":
        return JSONType;
      case "Number":
        return NumberType;
      case "Quaternion":
        return QuaternionType;
      case "Ref":
        return RefType;
      case "Select":
        return SelectType;
      case "String":
        return StringType;
      case "Vector3":
        return Vector3Type;
      case "Vector2":
        return Vector2Type;
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
    <svelte:component this={Type} {key} {component} {prop} on:modified />
  </div>
{/if}
