<script lang="ts">
  import type { Entity } from "~/ecs/base";
  import type { Component, ComponentProperty } from "~/ecs/base/Component";

  import AnimationSelectType from "./types/AnimationSelectType.svelte";
  import AssetType from "./types/AssetType.svelte";
  import BooleanType from "./types/BooleanType.svelte";
  import ColorType from "./types/ColorType.svelte";
  import FaceMapColorsType from "./types/FaceMapColorsType.svelte";
  import JSONType from "./types/JSONType.svelte";
  import MiscType from "./types/MiscType.svelte";
  import NumberType from "./types/NumberType.svelte";
  import QuaternionType from "./types/QuaternionType.svelte";
  import RefType from "./types/RefType.svelte";
  import SelectType from "./types/SelectType.svelte";
  import SphericalType from "./types/SphericalType.svelte";
  import StringType from "./types/StringType.svelte";
  import TextType from "./types/TextType.svelte";
  import Vector3Type from "./types/Vector3Type.svelte";

  export let key: string;
  export let component: Component;
  export let prop: ComponentProperty;
  export let entity: Entity = null;
  export let attrs = {};

  const Type = getTypeComponent(prop.editor?.input || prop.type.name);

  function getTypeComponent(propType) {
    switch (propType) {
      case "AnimationSelect":
        return AnimationSelectType;
      case "Asset":
        return AssetType;
      case "Boolean":
        return BooleanType;
      case "Color":
        return ColorType;
      case "Entity":
        return StringType;
      case "FaceMapColors":
        return FaceMapColorsType;
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
      case "Spherical":
        return SphericalType;
      case "String":
        return StringType;
      case "Text":
        return TextType;
      case "Vector2":
      case "Vector3":
        return Vector3Type;
      default:
        return MiscType;
    }
  }
</script>

{#if typeof Type === "string"}
  {Type}
{:else if component}
  <div>
    <svelte:component
      this={Type}
      {key}
      {component}
      {prop}
      {entity}
      {attrs}
      on:modified
    />
  </div>
{/if}

<style>
  div {
    margin: 8px 0px;
  }
</style>
