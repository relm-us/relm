import { isValidColor, isValidAppearance } from "relm-common";

export function isValidIdentity(identityPayload) {
  return (typeof identityPayload === "object")
            && (typeof identityPayload.name === "string")
            && (typeof identityPayload.color === "string" && isValidColor(identityPayload.color))
            && (typeof identityPayload.status === "string")
            && (typeof identityPayload.showAudio === "boolean")
            && (typeof identityPayload.showVideo === "boolean")
            && (
              ((typeof identityPayload.appearance === "object") && isValidAppearance(identityPayload.appearance))
                || (typeof identityPayload.appearance === "undefined")
            )
            && (typeof identityPayload.equipment === "object" || typeof identityPayload.equipment === "undefined");

}