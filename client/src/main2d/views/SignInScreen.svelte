<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "@zerodevx/svelte-toast";

  import { env } from "~/config";
  import { LoginManager } from "~/identity/LoginManager";
  import SignInDialog from "~/ui/Dialogs/SignInDialog.svelte";

  import Background from "./components/Background.svelte";

  export let api;
  export let dispatch;

  let loginManager;

  onMount(async () => {
    loginManager = new LoginManager(api, {
      notify: (text: string) => toast.push(text),
    });
  });
</script>

<Background />

<SignInDialog
  allowSignUp={false}
  canCancel={false}
  on:success={() => dispatch({ id: "didSignIn" })}
  on:cancel={() => window.open(env.home)}
  {loginManager}
/>
