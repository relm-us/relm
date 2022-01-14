import { Cmd } from "~/utils/runtime";

export const mapParticipantEffect = (participantEffect) => {
  return Cmd.mapEffect(participantEffect, (message) => ({
    id: "participantMessage",
    message,
  }));
};
