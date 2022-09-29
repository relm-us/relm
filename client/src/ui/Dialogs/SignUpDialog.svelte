<script lang="ts">
  import { _ } from "~/i18n";
  import { worldManager } from "~/world";
  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";

  import { openDialog } from "~/stores/openDialog";

  import SignInTextInput from "./components/SignInTextInput.svelte";

  let email: string;
  let password: string;

  async function onSignUp() {
    const isSuccess = await worldManager.logins.register({
      email,
      password,
    });

    if (isSuccess) {
      // close the sign-up dialog
      $openDialog = null;
    }
  }

  function onSignIn() {
    $openDialog = "signin";
  }
</script>

<Dialog title="Sign Up" on:cancel>
  <r-container>
    <r-form>
      <SignInTextInput label="email" type="email" bind:value={email} />
      <SignInTextInput
        label="pass code"
        type="password"
        bind:value={password}
      />
    </r-form>

    <Button on:click={onSignUp}>Sign Up</Button>

    <r-sign-in>
      Already have an account? <button on:click={onSignIn}>Sign In</button>
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
