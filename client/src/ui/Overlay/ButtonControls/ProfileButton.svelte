<script lang="ts">
  import FaUserAlt from "svelte-icons/fa/FaUserAlt.svelte";
  import { locale, _ } from "svelte-i18n";

  import { worldManager } from "~/world";
  import { openDialog } from "~/stores/openDialog";
  import { connectedAccount } from "~/stores/connectedAccount";
  import { graphicsQuality } from "~/stores/graphicsQuality";

  import PopContext from "~/ui/lib/PopContext";
  import Tooltip from "~/ui/lib/Tooltip";
  import CircleButton from "~/ui/lib/CircleButton";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { languageMap } from "~/i18n";

  let pop = false,
    x = 0,
    y = 0,
    triangleBottom = true;
  let button;

  function maybeClose(event) {
    if (hasAncestor(event.target, button)) return;
    if (pop) {
      pop = false;
      event.stopPropagation();
    }
  }

  function onClick(event) {
    const rect = button.getBoundingClientRect();
    x = rect.x + 26 /* half-width of button */;
    y = rect.y - 14 /* height of triangle */;
    if (x + 120 > window.innerWidth) {
      x = window.innerWidth - 120;
      triangleBottom = false;
    } else {
      triangleBottom = true;
    }
    pop = !pop;
  }
</script>

<r-pop-button>
  <Tooltip tip="Your profile" enabled={!pop} top>
    <div bind:this={button}>
      <CircleButton
        on:click={onClick}
        padding={0}
        Icon={FaUserAlt}
        iconSize={28}
      />
    </div>
  </Tooltip>
</r-pop-button>

{#if pop}
  <PopContext width={200} {x} {y} {triangleBottom}>
    {#if $connectedAccount}
      <r-option on:click={() => worldManager.logins.logout()}>
        {$_("ProfileButton.sign_out")}
        <r-option-current> someone@example.com </r-option-current>
      </r-option>
    {:else}
      <r-option on:click={() => ($openDialog = "signin")}>
        {$_("ProfileButton.sign_in")}
      </r-option>
    {/if}

    <r-option on:click={() => ($openDialog = "language")}>
      {$_("ProfileButton.language")}
      <r-option-current>
        {languageMap[$locale] || $locale}
      </r-option-current>
    </r-option>

    <r-option on:click={() => ($openDialog = "graphics-quality")}>
      {$_("ProfileButton.graphics_quality")}
      <r-option-current>
        {$_(`RenderQualityDialog.${$graphicsQuality}`)}
      </r-option-current>
    </r-option>

    <r-option on:click={() => ($openDialog = "avatar-appearance")}>
      {$_("ProfileButton.change_avatar")}
    </r-option>
  </PopContext>
{/if}

<svelte:window on:click={maybeClose} on:resize={() => (pop = false)} />

<style>
  r-pop-button {
    display: block;

    /* For r-pop to position absolutely */
    position: relative;
  }

  r-option {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 10px 12px 10px 12px;
    border-bottom: 1px solid 1px solid rgba(0, 0, 0, 0.15);

    cursor: pointer;
  }

  r-option-current {
    color: var(--selected-orange);
    font-size: 10px;
  }

  r-option:last-child {
    border-bottom: 1px solid transparent;
  }

  r-option:hover {
    background-color: var(--background-transparent-gray);
    border-radius: 8px;
  }
</style>
