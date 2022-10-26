import { Security } from "relm-common";

export const security = new Security({
  getSecret: () => JSON.parse(localStorage.getItem("secret") ?? "null"),
  setSecret: (secret) => localStorage.setItem("secret", JSON.stringify(secret)),
});
