import * as Y from "yjs";
import { get, writable, derived, Readable, Writable } from "svelte/store";
import { readableArray } from "svelt-yjs";
import { chatOpen } from "~/stores/chatOpen";
import { IdentityManager } from "~/identity/IdentityManager";

export type ChatMessage = {
  c: string;
  u: string;
};

export class ChatManager {
  identities: IdentityManager;

  /**
   * A store containing messages originating in Yjs doc
   */
  messages: Readable<Array<ChatMessage>> & { y: any };

  processed: Writable<number>;

  readCount: Writable<number>;
  unreadCount: Readable<number>;

  constructor(identities: IdentityManager, messages: Y.Array<ChatMessage>) {
    this.identities = identities;
    this.messages = readableArray(messages);
    this.processed = writable(0);

    this.readCount = writable(0);
    this.unreadCount = derived(
      [this.messages, this.readCount],
      ([$messages, $readCount], set) => {
        const count = $messages.length - $readCount;
        // Negative count can happen when we update readCount first, then messages
        set(count >= 0 ? count : 0);
      }
    );

    this.subscribe();
  }

  subscribe() {
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
        this.setSpeakingState(false);
      }
    });
  }

  setSpeakingState(value: boolean) {
    this.identities.me.sharedFields.update(($fields) => {
      return { ...$fields, speaking: value };
    });
  }

  addMessage(msg: ChatMessage) {
    // Don't count our own message as "unread"
    this.readCount.update(($count) => {
      return $count + 1;
    });
    // Broadcast via yjs
    this.messages.y.push([msg]);
    this.setSpeakingState(true);
  }
}
