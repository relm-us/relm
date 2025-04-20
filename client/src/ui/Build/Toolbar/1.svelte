<script lang="ts">
import FaRegSquare from "svelte-icons/fa/FaRegSquare.svelte"
import FaLowVision from "svelte-icons/fa/FaLowVision.svelte"
import FaMountain from "svelte-icons/fa/FaMountain.svelte"

import { globalEvents } from "~/events/globalEvents"
import { colliderEditMode } from "~/stores/colliderEditMode"

import ToolButton from "./ToolButton.svelte"

function onClick() {
  globalEvents.emit("cycle-advanced-edit")
}
</script>

<!-- Object/Ground Select -->
{#if $colliderEditMode === "normal"}
  <ToolButton
    shortcut={"1"}
    bgState={0}
    tip={"Edit objects only"}
    on:click={onClick}
  >
    <FaRegSquare />
  </ToolButton>
{:else if $colliderEditMode === "ground"}
  <ToolButton
    shortcut={"1"}
    bgState={2}
    tip={"Edit floors only"}
    on:click={onClick}
  >
    <FaMountain />
  </ToolButton>
{:else if $colliderEditMode === "invisible"}
  <ToolButton
    shortcut={"1"}
    bgState={3}
    tip={"Hide colliders"}
    on:click={onClick}
  >
    <FaLowVision />
  </ToolButton>
{/if}
