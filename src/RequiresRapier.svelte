<script lang="ts">
  const promise = import("@dimforge/rapier3d");

  type LoadingState = "LOADING" | "LOADED" | "ERROR";

  let state: LoadingState = "LOADING";
  let errmsg;

  promise
    .then((RAPIER) => {
      (window as any).RAPIER = RAPIER;
      state = "LOADED";
    })
    .catch((error) => {
      state = "ERROR";
      errmsg = error.message;
    });
</script>

{#if state === 'LOADING'}
  Loading
{:else if state === 'LOADED'}
  <slot />
{:else if state === 'ERROR'}
  There was an error loading the physics engine:
  {errmsg}
{/if}
