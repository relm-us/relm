<script lang="ts">
  import { portalAttendance } from "~/stores/portalAttendance";

  export let title;
  export let visible;

  // The entity that this Label is attached to
  // export let entity;

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <r-portal-attend>
    <r-count>{$portalAttendance[title] || 0}</r-count>
    <r-title>People in {title}</r-title>
  </r-portal-attend>
{/if}

<style>
  r-portal-attend {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    height: 40px;
    width: 40px;

    border-radius: 8px;
    background-color: var(--background-transparent-black);
    color: var(--foreground-white);

    padding: 8px;
  }

  r-count {
    font-size: 18px;
    font-weight: bold;
  }

  r-title {
    font-size: 10px;
  }
</style>
