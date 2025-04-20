<script lang="ts">
import type { SocialType } from "~/main/RelmOAuthAPI"

import { worldManager } from "~/world"

import facebookIcon from "./icons/facebook.png"
import googleIcon from "./icons/google.png"
import linkedinIcon from "./icons/linkedin.png"
import twitterIcon from "./icons/twitter.png"

const onClick = (socialType: SocialType) => async () => {
  const response = await worldManager.logins.loginWithThirdParty(socialType)
  if (response === null) {
    console.log("3rd party login window was closed")
    return // Window was closed
  }
}
async function onSocialClick({ target }) {
  const socialId = target.getAttribute("data-login")

  //   if (response.status === "success") {
  //     // Request identity data from server again and update our local identity if data from the server exists.
  //     await onAccountConnection();
  //   } else {
  //     // Error!
  //     notifyContext.addNotification({
  //       text: $_(response.reason, {
  //         default: response.details,
  //       }),
  //       position: "top-left",
  //       removeAfter: 3000,
  //     });
  //   }
}
</script>

<r-connections>
  <img
    src={facebookIcon}
    alt="Facebook"
    class="icon-aux"
    on:click={onClick("facebook")}
  />
  <img
    src={twitterIcon}
    alt="Twitter"
    class="icon-main"
    on:click={onClick("twitter")}
  />
  <img
    src={googleIcon}
    alt="Google"
    class="icon-main"
    on:click={onClick("google")}
  />
  <img
    src={linkedinIcon}
    alt="Linkedin"
    class="icon-aux"
    on:click={onClick("linkedin")}
  />
</r-connections>

<style>
  r-connections {
    align-self: center;
  }

  r-connections img {
    cursor: pointer;
  }
  r-connections img:hover {
    filter: brightness(1.4);
  }

  .icon-main {
    width: 32px;
    height: 32px;
  }
  .icon-aux {
    width: 29px;
    height: 32px;
  }
</style>
