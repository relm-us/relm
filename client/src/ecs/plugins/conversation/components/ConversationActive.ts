import { LocalComponent, RefType } from "~/ecs/base";
import { Conversation } from "./Conversation";

export class ConversationActive extends LocalComponent {
  static activator = Conversation;
}
