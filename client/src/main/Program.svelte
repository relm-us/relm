<!-- This component converts the functional UI state machine (raj) to Svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { runtime } from "~/utils/runtime";

  export let createApp;

  let programView;
  let programComponent;
  let programProps;

  onMount(() => {
    const app = createApp($$props);
    programView = app.view;
    const [_dispatch, end] = runtime({
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
    return end;
  });
</script>

<svelte:component this={programComponent} {...programProps} />
