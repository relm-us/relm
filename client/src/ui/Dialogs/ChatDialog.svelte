<script lang="ts">
import { createEventDispatcher } from "svelte"
import { _ } from "svelte-i18n"

import Dialog from "~/ui/lib/Dialog"

import { worldManager } from "~/world"
import { participantId } from "~/identity/participantId"

import MessageHistory from "./Chat/MessageHistory.svelte"
import MessageInput from "./Chat/MessageInput.svelte"

const dispatch = createEventDispatcher()
</script>

<Dialog align="right" fullHeight={true} tint={false} paddingH={12} on:cancel>
  <r-container>
    <MessageHistory
      messages={worldManager.chat.messages}
      myID={participantId}
    />
    <MessageInput on:close={() => dispatch("cancel")} />
  </r-container>
</Dialog>

<style>
  r-container {
    display: flex;
    flex-direction: column;
    width: 250px;

    /* Leave some room for absolute possitioned MessageInput */
    margin-bottom: 26px;
  }
</style>
