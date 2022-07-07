<script>
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";
  import { worldManager } from "~/world";
  import SignInCheckInput from "./components/SignInCheckInput.svelte";
  import SignInTextInput from "./components/SignInTextInput.svelte";

  export let enabled;

  function onClick() {
    worldManager.logout();
    enabled = false;
  }

</script>

<Fullwindow>
  <r-background></r-background>
  <r-window>
    <r-content>
      <!-- Email/password/toggles -->
      <r-group>
        <r-section class="add-top-spacing-if-tall-enough large">
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
            <r-forget-passcode-link>Forgot Pass Code</r-forget-passcode-link>
          </div>
        </r-section>

      </r-group>

      <!-- SIGN IN/Socials -->
      <r-group>
        <div class="submit add-top-spacing-if-tall-enough medium">
          <span>SIGN IN</span>
        </div>
        <div class="socials add-top-spacing-if-tall-enough medium">
          <span>or enter via:</span>
        </div>
      </r-group>

      <!-- Sign up text -->
      <r-group style="color: #d3ad0b">
        <span style="font-size:1.25em;">New here? Create Identity</span>
        <br />
        <span>START FOR FREE</span>
      </r-group>
    </r-content>
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
    cursor: pointer;
  }

  .submit span:hover {
    text-decoration: underline;
  }

  .socials span {
    color: #b8b8b8;
    font-size:1.25em;
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
  }

  r-section {
    display: block;
    margin-top: 0.5em;
  }

  r-forget-passcode-link {
    color: #a77822;
    cursor: pointer;
  }

  // Only show padding at top of screen if we can fit the rest of the content on screen.
  @media only screen and (min-height: 650px) {
    .add-top-spacing-if-tall-enough.large {
      padding-top: 30%;
    }
    .add-top-spacing-if-tall-enough.medium {
      padding-top: 15%;
    }

    r-section {
      margin-top: 1.5em;
    }
  }

  // Too much space between the r-group elements is terrible on mobile!
  @media only screen and (max-height: 400px) {
    r-group {
      height: max(33%, 5em);
    }
  }
  
  @media only screen and (min-height: 400px) and (max-height: 900px) {
    r-group {
      height: max(33%, 10em);
    }
  }

  @media only screen and (max-height: 900px) {
    // Text size of the submit button should be small to fit all content
    .submit span {
      font-size: 3em;
    }
  }

  @media only screen and (min-height: 900px) {
    r-group {
      height: 33%;
    }

    r-section {
      margin-top: 1.5em;
    }

    // Text size of the submit button can be bigger
    .submit span {
      font-size: 4em;
    }
  }
</style>