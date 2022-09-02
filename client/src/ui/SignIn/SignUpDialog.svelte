<script lang="ts">
  import { _ } from "~/i18n";
  import { worldManager } from "~/world";
  import Button from "~/ui/lib/Button";
  import Dialog from "~/ui/lib/Dialog";

  import SignInTextInput from "./components/SignInTextInput.svelte";
  import { openDialog } from "~/stores/openDialog";

  let email: string;
  let password: string;

  function onSignIn() {
    openDialog.set("signin");
  }
</script>

<Dialog title="Sign Up" on:cancel>
  <r-form>
    <SignInTextInput label="email" type="email" bind:value={email} />
    <SignInTextInput label="pass code" type="password" bind:value={password} />
  </r-form>

  <Button>Sign Up</Button>

  <r-sign-in>
    Already have an account? <button on:click={onSignIn}>Sign In</button>
  </r-sign-in>
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
