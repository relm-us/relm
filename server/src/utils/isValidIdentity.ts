import { isValidColor, isValidAppearance, PlayerStatus } from "relm-common";

function isValidStatus(status) {
  return (["initial", "present", "away"] as PlayerStatus[]).includes(status);
}

export function isValidIdentity(identityPayload) {
  return (typeof identityPayload === "object")
            && (typeof identityPayload.name === "string")
            && (typeof identityPayload.color === "string" && isValidColor(identityPayload.color))
            && (isValidStatus(identityPayload.status))
            && (
              ((typeof identityPayload.appearance === "object") && isValidAppearance(identityPayload.appearance))
                || (typeof identityPayload.appearance === "undefined")
            )
            && (typeof identityPayload.equipment === "object" || typeof identityPayload.equipment === "undefined");

}