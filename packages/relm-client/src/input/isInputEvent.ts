export function isInputEvent(event) {
  return (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA" ||
    event.target.getAttribute("contenteditable") !== null
  );
}
