<!-- This component converts the functional UI state machine (raj) to Svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { runtime } from "raj";

  export let createApp;

  let programView;
  let programComponent;
  let programProps;

  onMount(() => {
    const app = createApp($$props);
    programView = app.view;
    return runtime({
      ...app,
      view: (state, dispatch) => {
        const result = programView(state, dispatch);
        programComponent = result[0];
        if (result[1]) {
          programProps = { ...result[1], dispatch };
        } else {
          programProps = { dispatch };
        }
      },
    });
  });
</script>

<svelte:component this={programComponent} {...programProps} />
