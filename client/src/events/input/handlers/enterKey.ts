import { chatOpen, chatFocused } from "~/stores/chat";

export function onKeydown(event) {
  if (event.key === "Enter" || event.key === "Return") {
    event.preventDefault();

    chatOpen.set(true);
    chatFocused.set(true);
  }
}

export function onKeyup(event) {}
