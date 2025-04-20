import { LocalComponent } from "~/ecs/base"
import { Conversation } from "./Conversation"

export class ConversationActive extends LocalComponent {
  static activator = Conversation
  static defaultActive = false
}
