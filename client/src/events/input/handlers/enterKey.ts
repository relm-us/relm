import { chatOpen, chatFocused } from "~/stores/chatOpen";

export function onKeydown(event) {
  if (event.key === "Enter" || event.key === "Return") {
    event.preventDefault();

    chatOpen.set(true);
    chatFocused.set(true);
  }
}

export function onKeyup(event) {}
