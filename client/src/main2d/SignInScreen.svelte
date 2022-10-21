<script lang="ts">
  import { AuthenticationHeaders, Security } from "relm-common";
  import { onMount } from "svelte";
  import { getNotificationsContext } from "svelte-notifications";

  import { config, env } from "~/config";
  import { LoginManager } from "~/identity/LoginManager";
  import { participantId } from "~/identity/participantId";
  import { RelmRestAPI } from "~/main/RelmRestAPI";
  import SignInDialog from "~/ui/Dialogs/SignInDialog.svelte";

  // TODO: make this configurable?
  const signInBg =
    "https://assets.ourrelm.com/da15c70953c21875c81b584e21b88935-346972.webp";

  const notifyContext = getNotificationsContext();

  const security = new Security({
    getSecret: () => JSON.parse(localStorage.getItem("secret") ?? "null"),
    setSecret: (secret) =>
      localStorage.setItem("secret", JSON.stringify(secret)),
  });

  async function getAuthHeaders() {
    const pubkey = await security.exportPublicKey();
    const signature = await security.sign(participantId);

    const authHeaders: AuthenticationHeaders = {
      "x-relm-participant-id": participantId,
      "x-relm-participant-sig": signature,
      "x-relm-pubkey-x": pubkey.x,
      "x-relm-pubkey-y": pubkey.y,
    };

    return authHeaders;
  }

  let loginManager;

  onMount(async () => {
    const api = new RelmRestAPI(config.serverUrl, await getAuthHeaders());
    loginManager = new LoginManager(api, security, {
      notify: (text: string) => {
        notifyContext.addNotification({
          text,
          position: "bottom-center",
          removeAfter: 5000,
        });
      },
    });
  });
</script>

<r-sign-in-screen style="--sign-in-bg: url({signInBg})" />

<SignInDialog
  allowSignUp={false}
  on:success
  on:cancel={() => window.open(env.home)}
  {loginManager}
/>

<style>
  r-sign-in-screen {
    display: block;
    width: 100vw;
    height: 100vh;
    background-image: var(--sign-in-bg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
</style>
