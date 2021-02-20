import { get, writable, derived, Readable, Writable } from "svelte/store";
import { array } from "svelt-yjs";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { chatOpen } from "~/stores/chatOpen";

export type ChatMessage = {
  c: string;
  u: string;
};

export class ChatManager {
  wdoc: WorldDoc;

  /**
   * A store containing messages originating in Yjs doc
   */
  messages: Readable<Array<ChatMessage>> & { y: any };

  readCount: Writable<number>;
  unreadCount: Readable<number>;

  constructor(worldDoc) {
    this.wdoc = worldDoc;

    this.messages = array.readable(worldDoc.messages);
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

    // Whenever chat is opened, consider all messages "read"
    chatOpen.subscribe(($open) => {
      if ($open) {
        this.readCount.set(get(this.messages).length);
      }
    });
  }

  addMessage(msg: ChatMessage) {
    // Don't count our own message as "unread"
    this.readCount.update(($count) => {
      return $count + 1;
    });
    // Broadcast via yjs
    this.messages.y.push([msg]);
  }
}
