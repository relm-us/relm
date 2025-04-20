<script lang="ts">
import { onMount } from "svelte"
import hasAncestor from "./hasAncestor"

type Option = {
  label: string
  value: string
}

export let selected: string = null
export let options: Option[] = null
export let icon = null
export let onSelect: (option: Option) => void = null

let selectRowEl = null
let popupVisible = false
let hoverIndex = null
let selectedOption: Option

let optionsWithDefault

$: optionsWithDefault = options || []

$: selectedOption = optionsWithDefault.find((opt) => opt.value === selected)

const togglePopup = () => (popupVisible = !popupVisible)

const cancelPopup = (event) => {
  if (!hasAncestor(event.target, selectRowEl)) {
    popupVisible = false
  }
}

const makeSelection = (option) => {
  selected = option.value
  if (onSelect) {
    onSelect(option)
  }
}

const handleKeypress = (event) => {
  const options = optionsWithDefault
  if (event.key === "Escape" && popupVisible) {
    hoverIndex = null
    togglePopup()
  } else if (event.key === "Enter" || event.key === " ") {
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < options.length) {
      const option = options[hoverIndex]
      makeSelection(option)
    } else {
      hoverIndex = options.findIndex((opt) => opt.value === selected)
    }
    togglePopup()
  } else if (event.key === "ArrowUp") {
    if (--hoverIndex < 0) hoverIndex = 0
  } else if (event.key === "ArrowDown") {
    if (++hoverIndex >= options.length) hoverIndex = options.length - 1
  }
}

onMount(() => {
  document.addEventListener("click", cancelPopup)
  return () => {
    document.removeEventListener("click", cancelPopup)
  }
})
</script>

<vm-select>
  <!-- Invisible inline spacer that keeps inline position for popup to hover over -->
  <div class="placeholder">
    <div class="select-row">
      {#if icon}
        <div class="icon"><svelte:component this={icon} /></div>
      {/if}
      <div class="selected">{selectedOption ? selectedOption.label : ""}</div>
      <div class="down-arrow" />
    </div>
  </div>

  <div
    class="select"
    tabindex="0"
    on:keydown={handleKeypress}
    role="combobox"
    aria-expanded={popupVisible ? "true" : "false"}
    aria-controls="popup"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      bind:this={selectRowEl}
      on:click={togglePopup}
      class="select-row"
      class:open={popupVisible}
    >
      {#if icon}
        <div class="icon"><svelte:component this={icon} /></div>
      {/if}
      <div class="selected">{selectedOption ? selectedOption.label : ""}</div>
      <div class="down-arrow" />
    </div>
    {#if popupVisible}
      <div id="popup" class="popup" on:mouseleave={() => (hoverIndex = null)}>
        {#each optionsWithDefault as option, i}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="option"
            class:checkmark-selected={selectedOption
              ? selectedOption.value === option.value
              : false}
            class:hover={hoverIndex === i}
            data-value={option.value}
            on:click={() => makeSelection(option)}
            on:mouseenter={() => (hoverIndex = i)}
          >
            {option.label}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</vm-select>

<style>
  vm-select {
    position: relative;
    display: block;
    padding: 4px;
  }

  .placeholder,
  .select {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }
  .placeholder {
    min-width: 375px;
    color: transparent;
    --select-fg-color: transparent;
  }
  .select {
    position: absolute;
    top: 0;

    min-width: 375px;

    border: 1px solid rgba(180, 180, 180, 1);
    border-radius: 8px;

    cursor: pointer;
  }
  .select:focus {
    outline: none;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
    z-index: 2;
  }
  .select-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
  }
  .option {
    padding: 8px 8px 8px 24px;
  }
  .option.hover {
    background-color: var(
      --select-hover-bg-color,
      var(--select-bg-color, rgba(230, 230, 230, 1))
    );
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    filter: brightness(25%) saturate(100%);
  }

  .selected {
    flex-grow: 1;
  }

  .checkmark-selected {
    background-color: var(--select-bg-color, rgba(230, 230, 230, 1));
    border-radius: 5px;
  }
  .checkmark-selected::before {
    content: " \2714";
    display: block;
    position: absolute;
    margin-left: -12px;
    transform: translateX(-50%);
  }

  .down-arrow {
    border: solid var(--select-fg-color, black);
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(45deg);
    margin: 0px 8px;
  }

  .popup {
    display: flex;
    flex-direction: column;

    color: var(--select-fg-color, black);
    background-color: var(--select-bg-color, white);
    padding: 8px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
</style>
