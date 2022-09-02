<script lang="ts">
  import { _ } from "~/i18n";
  import { worldManager } from "~/world";
  import { openDialog } from "~/stores/openDialog";
  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";

  import ThirdPartyLogin from "./components/ThirdPartyLogin.svelte";
  import SignInTextInput from "./components/SignInTextInput.svelte";

  let email: string;
  let password: string;

  async function onSignIn() {
    const response = await worldManager.logins.loginWithCredentials({
      email,
      password,
    });
    console.log("response", response);
  }

  function onSignUp() {
    openDialog.set("signup");
  }
</script>

<Dialog title="Sign In" on:cancel>
  <r-form>
    <SignInTextInput label="email" type="email" bind:value={email} />
    <SignInTextInput label="pass code" type="password" bind:value={password} />
  </r-form>

  <Button on:click={onSignIn}>Sign In</Button>

  <r-or> or enter via: </r-or>

  <ThirdPartyLogin />

  <r-sign-up>
    New here? <button on:click={onSignUp}>Sign Up</button>
  </r-sign-up>
</Dialog>

<style>
  r-form {
    display: block;
    width: 230px;
    margin-bottom: 2em;
  }
  r-form > :global(*) {
    margin: 10px 0;
  }
  r-or {
    text-align: center;
    padding: 8px;
    color: var(--foreground-gray);
    font-size: 12px;
  }

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
