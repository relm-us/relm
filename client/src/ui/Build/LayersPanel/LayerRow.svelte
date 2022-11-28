<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";
  import IoMdEyeOff from "svelte-icons/io/IoMdEyeOff.svelte";
  import IoMdRemoveCircle from "svelte-icons/io/IoMdRemoveCircle.svelte";
  import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";
  import MdSelectAll from "svelte-icons/md/MdSelectAll.svelte";

  import IconButton from "~/ui/lib/IconButton";
  import { BASE_LAYER_ID } from "~/config/constants";
  import Tooltip from "~/ui/lib/Tooltip";
  import TextInput from "~/ui/lib/TextInput";

  export let id: string;
  export let name: string;
  export let visible: boolean;
  export let active: boolean;
  export let edit: boolean;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();

  // Holding "shift" while clicking makes the selection additive
  function onClick(event) {
    dispatch(event.shiftKey ? "selectAdd" : "select");
  }
</script>

<r-layer-row
  prop-id={id}
  class:selected
  class:active
  class:base={id === BASE_LAYER_ID}
>
  {#if edit}
    <r-edit-mode>
      <TextInput
        value={name}
        on:change={({ detail }) => dispatch("changeName", detail)}
        on:cancel={() => dispatch("cancelEdit")}
      />
    </r-edit-mode>
  {:else}
    <r-icon-bar>
      <!-- Show "eye" icon -->
      {#if visible}
        <IconButton width={24} height={24} on:click={() => dispatch("hide")}>
          <Tooltip
            tip={$_("LayersPanel.layer_visible_tip")}
            bottom={true}
            right={true}
          >
            <div style="color:var(--foreground-white)">
              <IoMdEye />
            </div>
          </Tooltip>
        </IconButton>
      {:else}
        <IconButton width={24} height={24} on:click={() => dispatch("show")}>
          <Tooltip
            tip={$_("LayersPanel.layer_visible_tip")}
            bottom={true}
            right={true}
          >
            <div style="color:var(--foreground-dark-gray)">
              <IoMdEyeOff />
            </div>
          </Tooltip>
        </IconButton>
      {/if}

      <!-- Select Entire Layer -->
      {#if visible}
        <IconButton width={18} height={18} on:click={onClick}>
          <Tooltip
            tip={$_("LayersPanel.layer_select_tip")}
            bottom={true}
            right={true}
          >
            <MdSelectAll />
          </Tooltip>
        </IconButton>
      {/if}
    </r-icon-bar>

    <!-- The Layer Name -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <r-name on:click>{name}</r-name>

    <r-icon-bar>
      <!-- Edit Layer Name -->
      <IconButton width={18} height={18} on:click={() => dispatch("edit")}>
        <Tooltip
          tip={$_("LayersPanel.layer_edit_tip")}
          bottom={true}
          left={true}
        >
          <IoMdCreate />
        </Tooltip>
      </IconButton>

      <!-- Delete Layer -->
      <IconButton width={18} height={18} on:click={() => dispatch("delete")}>
        <Tooltip
          tip={$_("LayersPanel.layer_delete_tip")}
          bottom={true}
          left={true}
        >
          <IoMdRemoveCircle />
        </Tooltip>
      </IconButton>
    </r-icon-bar>
  {/if}
</r-layer-row>

<style>
  r-layer-row {
    display: flex;
    height: 32px;
    padding: 2px 6px 2px 6px;
    align-items: center;
    border-bottom: 1px solid var(--outline-color);
  }
  r-layer-row:hover {
    background-color: rgba(20, 20, 20, 0.4);
  }
  r-layer-row:last-child {
    border-bottom: none;
  }
  r-layer-row.selected {
    background-color: var(--background-gray);
  }
  r-layer-row.active {
    background-color: var(--selected-orange);
    color: var(--background-gray);
  }
  r-layer-row.base {
    border: 1px solid var(--selected-orange-hover);
    border-radius: 3px;
  }

  r-name {
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;

    flex-grow: 1;
    padding-left: 6px;
    cursor: pointer;
  }

  r-icon-bar {
    display: flex;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
    color: var(--foreground-gray);
  }

  r-layer-row.active r-icon-bar {
    color: var(--background-gray);
  }
  r-layer-row.active:hover r-icon-bar {
    --color: var(--background-gray);
  }

  r-edit-mode {
    display: flex;
    align-items: center;
    --font-size: 16px;
  }
</style>
