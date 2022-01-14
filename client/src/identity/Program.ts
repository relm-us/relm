import { get } from "svelte/store";
import { Cmd } from "~/utils/runtime";

import { playerId } from "./playerId";
// import { ChatMessage } from "~/world/ChatManager";

import { makeLocalAvatar } from "./effects/makeLocalAvatar";
import { updateLocalParticipant } from "./effects/updateLocalParticipant";
import { subscribeBroker } from "./effects/subscribeBroker";

import { Program, State, Message, Effect, Dispatch } from "./ProgramTypes";
import { exists } from "~/utils/exists";
import { participantRemoveAvatar } from "./ParticipantManager";
import { Participant } from "./types";
import { localIdentityData } from "./identityData";

export function makeProgram(this: void): Program {
  return {
    init: [
      {
        participants: initParticipants(),
        localAvatarInitialized: false,
        unsubs: [],
      },
    ],
    update(msg: Message, state: State) {
      switch (msg.id) {
        case "init": {
          exists(state.participants, "participants");
          exists(msg.worldDoc, "worldDoc");
          exists(msg.ecsWorld, "ecsWorld");
          return [
            {
              ...state,
              worldDoc: msg.worldDoc,
              ecsWorld: msg.ecsWorld,
            },
            Cmd.batch<Effect>([
              subscribeBroker(msg.worldDoc, msg.ecsWorld, state.participants),
            ]),
          ];
        }

        case "join": {
          const localParticipant = state.participants.get(playerId);
          localParticipant.identityData.status = "present";
          return [state];
        }

        case "removeParticipant": {
          for (let [participantId, participant] of state.participants) {
            if (participant.identityData.clientId === msg.clientId) {
              participantRemoveAvatar(participant);
            }
          }
          return [state];
        }

        case "didSubscribeBroker": {
          const newState = { ...state, broker: msg.broker };
          newState.unsubs.push(msg.unsub);
          return [newState];
        }

        case "makeLocalAvatar": {
          exists(msg.entrywayPosition, "entrywayPosition");

          return [state, makeLocalAvatar(state.ecsWorld, msg.entrywayPosition)];
        }

        case "didMakeLocalAvatar": {
          const localParticipant = state.participants.get(playerId);
          localParticipant.avatar = msg.avatar;
          localParticipant.identityData.appearance;
          // msg.worldDoc.ydoc.clientID,
          // msg.appearance

          return [
            { ...state, localAvatarInitialized: true },
            updateLocalParticipant(
              localParticipant,
              localParticipant.identityData
            ),
          ];
        }

        case "recvParticipantData": {
          let participant;

          if (state.participants.has(msg.participantId)) {
            participant = state.participants.get(msg.participantId);
            participant.identityData = msg.identityData;
            participant.modified = true;
          } else {
            state.participants.set(msg.participantId, {
              participantId: msg.participantId,
              identityData: msg.identityData,
              isLocal: msg.isLocal,
              modified: true,
              /* no avatar yet, because this may be an inactive (stale) participant */
            });
          }

          return [state];
        }

        case "sendLocalParticipantData": {
          state.broker.setIdentityData(playerId, msg.identityData);
          return [state];
        }

        default:
          return [state];
      }
    },

    view(state: State, dispatch: Dispatch) {},
  } as Program;
}

function initParticipants() {
  const participants = new Map<string, Participant>();
  const identityData = get(localIdentityData);
  participants.set(playerId, {
    participantId: playerId,
    isLocal: true,
    modified: false,
    identityData,
  });
  return participants;
}
