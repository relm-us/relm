export const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("video-mirror");
