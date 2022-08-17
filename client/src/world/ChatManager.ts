import * as Y from "yjs";
import { get, writable, derived, Readable, Writable } from "svelte/store";
import { readableArray } from "svelt-yjs";
import { chatOpen, unreadCount } from "~/stores/chat";

export type ChatMessage = {
  // Message ("C"ontent)
  c: string;
  // Author ("U"ser)
  u: string;
  // Name ("N"ame)
  n: string;
  // Color (C"o"lor)
  o: string;
};

export function getEmojiFromMessage(msg) {
  const match = msg.c.toUpperCase().match(/^:([A-Z]+):$/);
  if (match) return match[1];
  else return null;
}

export class ChatManager {
  /**
   * A store containing messages originating in Yjs doc
   */
  messages: Readable<Array<ChatMessage>> & { y: any };
  setCommunicatingState: (
    message: string,
    state: "speaking" | "emoting",
    value: boolean
  ) => void;

  processed: Writable<number> = writable(0);

  readCount: Writable<number> = writable(0);

  init(
    messages: Y.Array<ChatMessage>,
    setCommunicatingState: (
      message: string,
      state: "speaking" | "emoting",
      value: boolean
    ) => void
  ) {
    this.setCommunicatingState = setCommunicatingState;
    this.setMessages(messages);
    this.readCount.set(messages.length);
  }

  setMessages(messages: Y.Array<ChatMessage>) {
    this.messages = readableArray(messages);

    derived([this.messages, this.readCount], ([$messages, $readCount], set) => {
      const count = $messages.length - $readCount;
      // Negative count can happen when we update readCount first, then messages
      unreadCount.set(count >= 0 ? count : 0);
    }).subscribe(() => {});

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

      // // Broadcast speech state to all players
      // TODO: FIXME
      // if (!$open) {
      //   this.setCommunicatingState(null, "speaking", false);
      // }
    });
  }

  addMessage(msg: ChatMessage) {
    // Don't count our own message as "unread"
    this.readCount.update(($count) => {
      return $count + 1;
    });
    // Broadcast via yjs
    this.messages.y.push([msg]);

    if (getEmojiFromMessage(msg)) {
      this.setCommunicatingState(msg.c, "emoting", true);
      setTimeout(() => {
        this.setCommunicatingState(msg.c, "emoting", false);
      }, 6000);
    } else {
      this.setCommunicatingState(msg.c, "speaking", true);
    }
  }
}
