<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import FaUserAlt from "svelte-icons/fa/FaUserAlt.svelte";
  import { AvatarBuilder } from "~/ui/AvatarBuilder";
  import { localIdentityData } from "~/stores/identityData";
  import { getNotificationsContext } from "svelte-notifications";

  const notifyContext = getNotificationsContext();

  let showBuilder = false;
  let builderEl;

  const onClick = () => {
    if ($localIdentityData.appearance) {
      showBuilder = !showBuilder;
    } else {
      notifyContext.addNotification({
        text: "Something went wrong",
        position: "bottom-center",
        removeAfter: 3000,
      });
    }
  };

  // escape absolute/relative positioned elements
  $: if (showBuilder && builderEl) document.body.appendChild(builderEl);
</script>

<CircleButton on:click={onClick} padding={0} Icon={FaUserAlt} iconSize={28}>
  <slot />
</CircleButton>

{#if showBuilder}
  <div class="builder" bind:this={builderEl}>
    <AvatarBuilder
      on:click={() => (showBuilder = false)}
      {...$localIdentityData.appearance}
    />
  </div>
{/if}

<style>
  .builder {
    position: absolute;
    z-index: 4;
    top: 0;
    right: 8px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    width: 200px;
    height: 100vh;

    pointer-events: all;
  }
</style>
