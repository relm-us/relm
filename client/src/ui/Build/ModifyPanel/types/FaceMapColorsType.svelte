<script lang="ts">
import type { Component, Entity } from "~/ecs/base"
import { Color } from "three"

import { createEventDispatcher } from "svelte"

import ColorPicker from "~/ui/lib/ColorPicker"
import Slider from "~/ui/lib/Slider"

import { ModelRef } from "~/ecs/plugins/model"
import { getFacemapNames } from "~/ecs/plugins/coloration/getFacemapNames"

import NumberInput from "./utils/NumberInput.svelte"

export let key: string
export let component: Component
export let entity: Entity
export let prop

const dispatch = createEventDispatcher()

function getAllFacemapNames(entity): string[] {
  const ref: ModelRef = entity.get(ModelRef)
  const scene = ref?.value?.scene
  if (!scene) return []

  let facemapNames = new Set<string>()
  scene.traverse((node) => {
    if ((node as any).isMesh) {
      getFacemapNames(node)?.forEach((name) => {
        facemapNames.add(name)
      })
    }
  })

  return Array.from(facemapNames)
}

const getFacemapColor = (name: string): string => {
  const facemap = component[key]
  if (facemap) {
    const pair = component[key][name]
    if (pair) return pair[0]
  }
  return "#FFFFFF"
}

const setFacemapColor =
  (name) =>
  ({ detail }) => {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail
    const color = new Color(cssColor)
    const newValue = "#" + color.getHexString()

    // initialize if necessary
    if (component[key] === null) component[key] = {}

    if (!(name in component[key])) {
      component[key][name] = [newValue, 0.0]
    } else {
      component[key][name][0] = newValue
    }

    // Notify ECS system
    component.modified()

    // Dispatch a message that will sync yjs
    dispatch("modified")
  }

const getFacemapWeight = (component: Component, name: string): number => {
  const facemap = component[key]
  if (facemap) {
    const pair = facemap[name]
    if (pair) return pair[1]
  }

  return 0
}

function setFacemapWeight(name: string, weight: number, finalize: boolean) {
  // initialize if necessary
  if (component[key] === null) component[key] = {}

  if (!(name in component[key])) {
    component[key][name] = ["#FFFFFF", weight]
  } else {
    component[key][name][1] = weight
  }

  // Notify ECS system
  component.modified()

  // Dispatch a message that will sync yjs
  if (finalize) dispatch("modified")
}

const setFacemapWeightNumberInput =
  (name: string) =>
  ({ detail }) =>
    setFacemapWeight(name, detail.value, detail.final)

const setFacemapWeightSlider =
  (name: string, finalize: boolean) =>
  ({ detail: weight }) =>
    setFacemapWeight(name, weight, finalize)

let value
$: {
  const color = new Color(component[key])
  value = "#" + color.getHexString()
}

// ignore warning about missing props
$$props
</script>

<r-facemap-type>
  <r-label>{(prop.editor && prop.editor.label) || key}:</r-label>

  <r-list>
    {#each getAllFacemapNames(entity) as name}
      <r-row>
        <r-line1>
          <div>{name}</div>
        </r-line1>
        <r-line2>
          <NumberInput
            value={getFacemapWeight(component, name)}
            on:value={setFacemapWeightNumberInput(name)}
          />
          <div style="width: 100%; padding: 0 6px">
            <Slider
              value={getFacemapWeight(component, name)}
              on:change={setFacemapWeightSlider(name, false)}
              on:end={setFacemapWeightSlider(name, true)}
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
</style>
