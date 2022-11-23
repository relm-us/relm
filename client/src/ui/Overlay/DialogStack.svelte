<script lang="ts">
  import { fade } from "svelte/transition";

  import { CROSS_FADE_DURATION } from "~/config/constants";

  import { worldManager } from "~/world";

  import { openDialog } from "~/stores/openDialog";
  import { localIdentityData } from "~/stores/identityData";

  import ChangeAvatarDialog from "~/ui/Dialogs/ChangeAvatarDialog.svelte";
  import ChatDialog from "../Dialogs/ChatDialog.svelte";
  import GraphicsQualityDialog from "~/ui/Dialogs/GraphicsQualityDialog.svelte";
  import InviteDialog from "~/ui//Dialogs/InviteDialog.svelte";
  import LanguageDialog from "~/ui/Dialogs/LanguageDialog.svelte";
  import NeedsMigrationDialog from "~/ui/Dialogs/NeedsMigrationDialog.svelte";
  import PauseDialog from "~/ui/Dialogs/PauseDialog.svelte";
  import SignInDialog from "~/ui//Dialogs/SignInDialog.svelte";
  import SignUpDialog from "~/ui//Dialogs/SignUpDialog.svelte";
</script>

{#if $openDialog !== null}
  <div
    transition:fade={{ duration: CROSS_FADE_DURATION }}
    style="position:absolute;z-index:100"
  >
    {#if $openDialog === "avatar-appearance"}
      <ChangeAvatarDialog
        on:cancel={() => ($openDialog = null)}
        appearance={$localIdentityData.appearance}
        color={$localIdentityData.color}
      />
    {:else if $openDialog === "chat"}
      <ChatDialog on:cancel={() => ($openDialog = null)} />
    {:else if $openDialog === "graphics-quality"}
      <GraphicsQualityDialog on:cancel={() => ($openDialog = null)} />
    {:else if $openDialog === "invite"}
      <InviteDialog on:cancel={() => ($openDialog = null)} />
    {:else if $openDialog === "language"}
      <LanguageDialog on:cancel={() => ($openDialog = null)} />
    {:else if $openDialog === "signin"}
      <SignInDialog
        on:success={() => ($openDialog = null)}
        on:signup={() => ($openDialog = "signup")}
        on:cancel={() => ($openDialog = null)}
        loginManager={worldManager.logins}
      />
    {:else if $openDialog === "signup"}
      <SignUpDialog
        on:success={() => ($openDialog = null)}
        on:signin={() => ($openDialog = "signin")}
        on:cancel={() => ($openDialog = null)}
        loginManager={worldManager.logins}
      />
    {:else if $openDialog === "pause"}
      <PauseDialog on:cancel={() => worldManager.togglePaused()} />
    {:else if $openDialog === "needs-migration"}
      <NeedsMigrationDialog on:cancel={() => ($openDialog = null)} />
    {/if}
  </div>
{/if}
