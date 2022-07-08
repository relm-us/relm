<script>
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { worldManager } from "~/world";
  import SignInCheckInput from "./components/SignInCheckInput.svelte";
  import SignInTextInput from "./components/SignInTextInput.svelte";

  export let enabled;
  
  let showingSignin = true;

  function onClick() {
    worldManager.logout();
    enabled = false;
  }

  function switchScreen() {
    showingSignin = !showingSignin;
  }

</script>

<Fullwindow>
  <r-background></r-background>
  <r-window>
    <!-- SIGNIN WINDOW -->
    {#if showingSignin}
      <r-content>
        <!-- Email/password/toggles -->
        <r-group>
          <r-section class="add-padding-if-tall-enough medium">
            <SignInTextInput type="email" label="EMAIL" />
          </r-section>

          <r-section>
            <SignInTextInput type="password" label="PASS CODE" />
          </r-section>

          <r-section id="stay-logged-forget-section">
            <div style="float: left; padding-bottom: 1em;">
              <SignInCheckInput label="Stay unlocked on this device" />
            </div>
            <div style="float: right;">
              <r-forget-passcode-link class="fake-link">Forgot Pass Code</r-forget-passcode-link>
            </div>
          </r-section>

        </r-group>

        <!-- SIGN IN/Socials -->
        <r-group>
          <div class="submit add-padding-if-tall-enough small">
            <span class="fake-link">SIGN IN</span>
          </div>
          <div class="socials add-padding-if-tall-enough small">
            <span>or enter via:</span><br />
            <r-connections>
              <img src="/social/facebook.png" alt="Facebook" />
              <img src="/social/twitter.png" alt="Twitter" />
              <img src="/social/google.png" alt="Google" />
              <img src="/social/linkedin.png" alt="Linkedin" />
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
        <r-section class="add-padding-if-tall-enough biggest">
          <SignInTextInput type="email" label="EMAIL" />
        </r-section>
        <r-section>
          <SignInTextInput type="password" label="PASS CODE" />
        </r-section>
        <r-section class="socials">
          <r-connections>
            <img src="/social/facebook.png" alt="Facebook" />
            <img src="/social/twitter.png" alt="Twitter" />
            <img src="/social/google.png" alt="Google" />
            <img src="/social/linkedin.png" alt="Linkedin" />
          </r-connections>
        </r-section>
        <r-section style="position: absolute; transform: translateX(-15%); width: 150%;">
          <div class="submit">
            <span class="fake-link">CREATE ACCOUNT</span>
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

  #stay-logged-forget-section {
    display: flex;
    text-align: initial;
    justify-content: space-between;
    font-size: 1.1em;
  }

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

  r-forget-passcode-link {
    color: #a77822;
    cursor: pointer;
  }

  // Only show padding at top if the screen is tall enough.
  @media only screen and (min-height: 800px) {
    .add-padding-if-tall-enough.biggest {
      padding-top: 75%;
    }
    .add-padding-if-tall-enough.large {
      padding-top: 50%;
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