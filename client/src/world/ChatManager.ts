import * as Y from "yjs";
import { get, writable, derived, Readable, Writable } from "svelte/store";
import { readableArray } from "svelt-yjs";
import { chatOpen } from "~/stores/chatOpen";
import { IdentityManager } from "~/identity/IdentityManager";

export type ChatMessage = {
  // Message ("C"ontent)
  c: string;
  // Author ("U"ser)
  u: string;
};

export function getEmojiFromMessage(msg) {
  const match = msg.c.toUpperCase().match(/^:([A-Z]+):$/);
  if (match) return match[1];
  else return null;
}

export class ChatManager {
  identities: IdentityManager;

  /**
   * A store containing messages originating in Yjs doc
   */
  messages: Readable<Array<ChatMessage>> & { y: any };

  processed: Writable<number> = writable(0);

  readCount: Writable<number> = writable(0);
  unreadCount: Readable<number>;

  constructor(identities: IdentityManager) {
    this.identities = identities;
  }

  setMessages(messages: Y.Array<ChatMessage>) {
    this.messages = readableArray(messages);

    this.unreadCount = derived(
      [this.messages, this.readCount],
      ([$messages, $readCount], set) => {
        const count = $messages.length - $readCount;
        // Negative count can happen when we update readCount first, then messages
        set(count >= 0 ? count : 0);
      }
    );

    // Consider all past chat history as "read" when entering the relm
    let doneFirstPass = false;
    let unsubscribe = this.messages.subscribe(($messages) => {
      if (doneFirstPass) {
        this.readCount.set($messages.length);
        unsubscribe();
        unsubscribe = null;
      }
      doneFirstPass = true;
    });

    chatOpen.subscribe(($open) => {
      // Whenever chat is opened, consider all messages "read"
      if ($open) {
        this.readCount.set(get(this.messages).length);
      }

      // Broadcast speech state to all players
      if (!$open) {
        this.setActingState("speaking", false);
      }
    });
  }

  setActingState(key: string, value: boolean) {
    this.identities.me.set({ [key]: value });
    // get(myIdentity).set({ [key]: value });
  }

  addMessage(msg: ChatMessage) {
    // Don't count our own message as "unread"
    this.readCount.update(($count) => {
      return $count + 1;
    });
    // Broadcast via yjs
    this.messages.y.push([msg]);

    if (getEmojiFromMessage(msg)) {
      this.setActingState("emoting", true);
      setTimeout(() => {
        this.setActingState("emoting", false);
      }, 6000);
    } else {
      this.setActingState("speaking", true);
    }
  }
}
