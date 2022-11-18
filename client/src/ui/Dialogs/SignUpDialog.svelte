<script lang="ts">
  import type { LoginManager } from "~/identity/LoginManager";

  import { createEventDispatcher } from "svelte";
  import { _ } from "~/i18n";

  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";

  import SignInTextInput from "./components/SignInTextInput.svelte";

  export let canCancel = true;
  export let loginManager: LoginManager;

  const dispatch = createEventDispatcher();

  let emailInstance = null;
  let email: string;
  let password: string;

  async function onSignUp() {
    const isSuccess = await loginManager.register({
      email,
      password,
    });

    if (isSuccess) {
      // close the sign-up dialog
      dispatch("success");
    }
  }

  function onSignIn() {
    dispatch("signin");
  }
</script>

<Dialog title={$_("SignUpDialog.title")} {canCancel} on:cancel>
  <r-container>
    <r-form>
      <SignInTextInput
        type="email"
        label={$_("SignUpDialog.email")}
        bind:value={email}
        bind:this={emailInstance}
        on:submit={onSignUp}
      />
      <SignInTextInput
        type="password"
        label={$_("SignUpDialog.password")}
        bind:value={password}
        on:submit={onSignUp}
      />
    </r-form>

    <Button on:click={onSignUp}>{$_("SignUpDialog.sign_up")}</Button>

    <r-sign-in>
      {$_("SignUpDialog.already_have_account")}
      <button on:click={onSignIn}>{$_("SignUpDialog.sign_in")}</button>
    </r-sign-in>
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

  r-sign-in {
    text-align: center;
    padding-top: 32px;
    color: var(--selected-orange);
    font-size: 14px;
  }
  r-sign-in button {
    all: unset;
    color: var(--selected-orange);
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
  }
  r-sign-in button:hover {
    color: var(--selected-orange-hover);
  }
</style>
