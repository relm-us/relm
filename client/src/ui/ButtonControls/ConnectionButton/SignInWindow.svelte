<script lang="ts">
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { worldManager } from "~/world";
  import SignInTextInput from "./components/SignInTextInput.svelte";
  import type { Dispatch } from "~/main/ProgramTypes";
  import { showCenterButtons } from "~/stores/showCenterButtons";
  import { getNotificationsContext } from "svelte-notifications";
  import { _ } from "~/i18n";

  export let enabled;
  export let dispatch: Dispatch;

  const notifyContext = getNotificationsContext();

  let showingSignin = true;

  async function onSocialClick({ target }) {
    const socialId = target.getAttribute("data-login");

    const response = await worldManager.login(socialId);
    if (response === null || !enabled) {
      return; // Window was closed or ui is no longer shown.
    }

    if (response.status === "success") {
      // Request identity data from server again and update our local identity if data from the server exists.
      await onAccountConnection();
    } else {
      // Error!
      notifyContext.addNotification({
        text: $_(response.reason, {
          default: response.details
        }),
        position: "top-left",
        removeAfter: 3000
      });
    }

  }

  async function onUsernamePasswordAction(action: "signin"|"register") {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement).value;
    const password = (document.querySelector('input[name="password"]') as HTMLInputElement).value;

    const response = action === "register"
      ? await worldManager.register({ email, password }) 
      : await worldManager.login({ email, password });
    
    if (response.status === "success") {
      // Username/password was successfully registered.
      await onAccountConnection();
    } else {
      // Error!
      notifyContext.addNotification({
        text: $_(response.reason, {
          default: response.details
        }),
        position: "top-left",
        removeAfter: 3000
      });
    }
  }

  async function onAccountConnection() {
    const savedData = await worldManager.api.getIdentityData();

    let successText;
    if (savedData.identity === null) {
      // No identity data saved? Create some!
      await worldManager.api.setIdentityData({
        identity: worldManager.participants.local.identityData
      });
      successText = $_("account_creation", {
          default: "Your account has been created!"
       });
    } else {
      // Load existing identity data!
      dispatch({
        id: "updateLocalIdentityData",
        identityData: savedData.identity
      });
      successText = $_("account_connected", {
        default: "Your account has been connected!"
      });
    }

    // Close the sign in window.
    exitScreen();
    notifyContext.addNotification({
      text: successText,
      position: "bottom-center",
      removeAfter: 5000
    });
  }


  function switchScreen() {
    showingSignin = !showingSignin;
  }

  function exitScreen() {
    enabled = false;
    $showCenterButtons = true;
  }

</script>

<Fullwindow>
  <r-background></r-background>
  <r-exit on:click={exitScreen}>
    <img src="/ESC_button.png" style="width: 48px;" alt="Signout" />
  </r-exit>
  <r-window>
    <!-- SIGNIN WINDOW -->
    {#if showingSignin}
      <r-content>
        <!-- Email/password/toggles -->
        <r-group>
          <r-section class="add-padding-if-tall-enough medium">
            <SignInTextInput name="email" type="email" label="EMAIL" />
          </r-section>

          <r-section>
            <SignInTextInput name="password" type="password" label="PASS CODE" />
          </r-section>

          <!-- <r-section id="forget-section">
            <div style="float: left;">
              <r-forget-passcode-link class="fake-link">Forgot Pass Code</r-forget-passcode-link>
            </div>
          </r-section> -->

        </r-group>

        <!-- SIGN IN/Socials -->
        <r-group>
          <div class="submit">
            <span class="fake-link" on:click={() => onUsernamePasswordAction("signin")} >SIGN IN</span>
          </div>
          <div class="socials add-padding-if-tall-enough small">
            <span>or enter via:</span><br />
            <r-connections>
              <img src="/social/facebook.png" data-login="facebook" alt="Facebook" on:click={onSocialClick} />
              <img src="/social/twitter.png" data-login="twitter" alt="Twitter" on:click={onSocialClick} />
              <img src="/social/google.png" data-login="google" alt="Google" on:click={onSocialClick} />
              <img src="/social/linkedin.png" data-login="linkedin" alt="Linkedin" on:click={onSocialClick} />
            </r-connections>
          </div>
        </r-group>

        <!-- Sign up text -->
        <r-group class="switch-screen-text" style="padding-top: 10%;" on:click={switchScreen}>
          <div class="fake-link">
            <span>New here? Create Identity</span>
            <br />
            <span>START FOR FREE</span>
          </div>
        </r-group>
      </r-content>
    {:else}
      <!-- REGISTER WINDOW -->
      <r-content style="position: relative;" id="register">
        <r-section class="add-padding-if-tall-enough large">
          <SignInTextInput name="email" type="email" label="EMAIL" />
        </r-section>
        <r-section>
          <SignInTextInput name="password" type="password" label="PASS CODE" />
        </r-section>
        <r-section class="socials">
          <r-connections>
            <img src="/social/facebook.png" data-login="facebook" alt="Facebook" on:click={onSocialClick} />
            <img src="/social/twitter.png" data-login="twitter" alt="Twitter" on:click={onSocialClick} />
            <img src="/social/google.png" data-login="google" alt="Google" on:click={onSocialClick} />
            <img src="/social/linkedin.png" data-login="linkedin" alt="Linkedin" on:click={onSocialClick} />
          </r-connections>
        </r-section>
        <r-section style="position: absolute; transform: translateX(-15%); width: 150%;">
          <div class="submit">
            <span class="fake-link" on:click={() => onUsernamePasswordAction("register")} >CREATE ACCOUNT</span>
          </div>

          <r-group class="switch-screen-text" on:click={switchScreen}>
            <span class="fake-link">Already have an account? Sign in</span>
          </r-group>
        </r-section>
      </r-content>
    {/if}
  </r-window>
</Fullwindow>

<style type="scss">

  // svelte-notifications does not have a high enough z-index.
  :global(.notifications div) {
    z-index: 9999;
  }

  // #forget-section {
  //   display: flex;
  //   text-align: initial;
  //   justify-content: space-between;
  //   font-size: 1.1em;
  // }

  .submit span {
    color: #7f7f7f;
    font-size: 4em;
  }

  .switch-screen-text {
    color: #d3ad0b;
  }

  .switch-screen-text span {
    font-size: 1.25em;
  }

  .fake-link:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .socials span {
    color: #b8b8b8;
    font-size: 1.25em;
  }

  .socials r-connections {
    display: flex;
    justify-content: space-evenly;
    width: calc(100% - 48px * 4);
    margin-left: calc(48px * 2);
  }

  .socials r-connections img {
    width: 48px;
    height: 48px;
    padding-right: 10px;
  }

  .socials r-connections img:hover {
    cursor: pointer;
  }

  r-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    background: #000000;
    opacity: 0.7;
  }

  r-exit {
    display: block;
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
  }

  r-window {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-content {
    width: 20%;
    min-width: min(25em, 90vw);
    height: 100%;
    text-align: center;
    cursor: default;
  }

  r-group {
    display: block;
    height: 33%;
  }

  r-section {
    display: block;
    margin-top: 0.5em;
  }

  // r-forget-passcode-link {
  //   color: #a77822;
  //   cursor: pointer;
  // }

  // Only show padding at top if the screen is tall enough.
  @media only screen and (min-height: 800px) {
    .add-padding-if-tall-enough.large {
      padding-top: 75%;
    }
    .add-padding-if-tall-enough.medium {
      padding-top: 30%;
    }
    .add-padding-if-tall-enough.small {
      padding-top: 20%;
    }

    r-section {
      margin-top: 1.5em;
    }
  }

  // Adding padding above CREATE ACCOUNT only if the height will allow it
  @media only screen and (max-height: 800px) {
    #register .submit {
      padding-top: 2em;
    }
  }

  // If on Mobile, make the submit text smaller
  @media only screen and (max-width: 450px) {
    .submit span {
      font-size: 2.5em;
    }

    r-group {
      height: 25%;
    }
  }
</style>