<script lang="ts">
  import { SvelteComponent, createEventDispatcher } from "svelte";
  import { _ } from "~/i18n";

  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";

  // import ThirdPartyLogin from "./components/ThirdPartyLogin.svelte";
  import SignInTextInput from "./components/SignInTextInput.svelte";

  export let loginManager;
  export let allowSignUp = true;
  export let canCancel = true;

  const dispatch = createEventDispatcher();

  let emailInstance: SvelteComponent = null;
  let email: string;
  let password: string;

  async function onSignIn() {
    const isSuccess = await loginManager.loginWithCredentials({
      email,
      password,
    });

    if (isSuccess) {
      dispatch("success");
    }
  }

  function onSignUp() {
    dispatch("signup");
  }
</script>

<Dialog title="Sign In" {canCancel} on:cancel>
  <r-container>
    <r-form>
      <SignInTextInput
        label="email"
        type="email"
        bind:value={email}
        bind:this={emailInstance}
        on:submit={onSignIn}
      />
      <SignInTextInput
        label="pass code"
        type="password"
        bind:value={password}
        on:submit={onSignIn}
      />
    </r-form>

    <Button on:click={onSignIn}>Sign In</Button>

    <!-- <r-or> or enter via: </r-or> -->

    <!-- <ThirdPartyLogin /> -->

    {#if allowSignUp}
      <r-sign-up>
        New here? <button on:click={onSignUp}>Sign Up</button>
      </r-sign-up>
    {/if}
  </r-container>
</Dialog>

<style>
  r-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  r-form {
    display: block;
    width: 230px;
    margin-bottom: 2em;
  }

  r-form > :global(*) {
    margin: 10px 0;
  }
  /* r-or {
    text-align: center;
    padding: 8px;
    color: var(--foreground-gray);
    font-size: 12px;
  } */

  r-sign-up {
    text-align: center;
    padding-top: 32px;
    color: var(--selected-orange);
    font-size: 14px;
  }
  r-sign-up button {
    all: unset;
    color: var(--selected-orange);
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
  }
  r-sign-up button:hover {
    color: var(--selected-orange-hover);
  }
</style>
