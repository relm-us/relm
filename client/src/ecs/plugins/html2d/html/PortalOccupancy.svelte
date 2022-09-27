<script lang="ts">
  import { _ } from "svelte-i18n";
  import { portalOccupancy } from "~/stores/portalOccupancy";

  export let title;
  export let visible;

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <r-portal-attend>
    <r-title>{title}</r-title>
    <r-count>
      {$_("PortalOccupancy.count", {
        values: { count: $portalOccupancy[title] || 0 },
      })}
    </r-count>
  </r-portal-attend>
{/if}

<style>
  r-portal-attend {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    border-radius: 8px;
    background-color: var(--background-transparent-black);
    color: var(--foreground-white);

    padding: 16px;
  }

  r-count {
    font-size: 18px;
    font-weight: bold;
    margin: 8px;
  }

  r-title {
    font-size: 10px;
    line-break: anywhere;
  }
</style>
