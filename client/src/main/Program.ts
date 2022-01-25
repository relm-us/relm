import { get, Writable } from "svelte/store";
import { Vector3 } from "three";
import { DeviceIds } from "video-mirror";

import { worldManager } from "~/world";

import { Cmd } from "~/utils/runtime";
import { exists } from "~/utils/exists";

import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";

import { AVConnection } from "~/av/AVConnection";

import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";
import { preferredDeviceIds } from "~/stores/preferredDeviceIds";
import { askAvatarSetup } from "~/stores/askAvatarSetup";

import type { State, Message, Program, Effect } from "./ProgramTypes";

import { initParticipants } from "./init/initParticipants";

import { createECSWorld } from "./effects/createECSWorld";
import { getPositionFromEntryway } from "./effects/getPositionFromEntryway";
import { initWorldManager } from "./effects/initWorldManager";
import { getRelmPermitsAndMetadata } from "./effects/getRelmPermitsAndMetadata";
import { importPhysicsEngine } from "./effects/importPhysicsEngine";
import { nextSetupStep } from "./effects/nextSetupStep";
import { createWorldDoc } from "./effects/createWorldDoc";
import { getPageParams } from "./effects/getPageParams";
import { joinAudioVideo } from "./effects/joinAudioVideo";
import { updateLocalParticipant } from "./effects/updateLocalParticipant";
import { getAuthenticationHeaders } from "./effects/getAuthenticationHeaders";
import { pollLoadingState } from "./effects/pollLoadingState";
import { subscribeBroker } from "./effects/subscribeBroker";
import { makeLocalAvatar } from "./effects/makeLocalAvatar";

import GameWorld from "./views/GameWorld.svelte";
import ErrorScreen from "./views/ErrorScreen.svelte";
import BlankWithLogo from "./views/BlankWithLogo.svelte";
import MediaSetupShim from "./views/MediaSetupShim.svelte";
import LoadingScreen from "./views/LoadingScreen.svelte";
import LoadingFailed from "./views/LoadingFailed.svelte";

import { playerId } from "~/identity/playerId";
import { participantRemoveAvatar } from "~/identity/ParticipantManager";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("program");

/**
 * The main Relm program
 */
export function makeProgram(): Program {
  const init: [State, Effect] = [
    {
      participantId: playerId,
      worldDocStatus: "disconnected",
      screen: "initial",
      participants: initParticipants(),
      localAvatarInitialized: false,
      unsubs: [],

      audioDesired: audioDesired as Writable<boolean>,
      videoDesired: videoDesired as Writable<boolean>,
      preferredDeviceIds: preferredDeviceIds as Writable<DeviceIds>,
    },
    getPageParams,
  ];

  const update = (msg: Message, state: State): [State, any?] => {
    if (logEnabled) {
      console.log(
        `program msg '${msg.id}' (${state.pageParams?.relmName}): %o`,
        {
          msg,
          state,
        }
      );
    }

    // Handle Program updates
    switch (msg.id) {
      case "gotPageParams": {
        exists(msg.pageParams);

        return [
          { ...state, pageParams: msg.pageParams },
          getAuthenticationHeaders(msg.pageParams),
        ];
      }

      case "gotAuthenticationHeaders": {
        exists(msg.authHeaders);

        return [
          {
            ...state,
            authHeaders: msg.authHeaders,
            avConnection: new AVConnection(state.participantId),
          },
          getRelmPermitsAndMetadata(state.pageParams, msg.authHeaders),
        ];
      }

      case "gotRelmPermitsAndMetadata": {
        exists(msg.permits, "permits");
        exists(msg.relmDocId, "relmDocId");
        exists(msg.entitiesMax, "entitiesMax");
        exists(msg.assetsMax, "assetsMax");
        exists(msg.twilioToken, "twilioToken");

        return [
          {
            ...state,
            participantName: msg.participantName,
            permits: msg.permits,
            relmDocId: msg.relmDocId,
            entitiesMax: msg.entitiesMax,
            assetsMax: msg.assetsMax,
            twilioToken: msg.twilioToken,
          },

          // Kick off parallel tasks:
          //
          // physics      audio/video
          //    v              v
          //   ECS           avatar
          //    v              |
          // worldDoc          |
          //    \             /
          //     `> loading <'
          //
          Cmd.batch([importPhysicsEngine, nextSetupStep(state)]),
        ];
      }

      // Participants program
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

      case "participantJoined": {
        if (state.notifyContext) {
          state.notifyContext.addNotification({
            text: `${msg.participant.identityData.name} joined.`,
            position: "bottom-center",
            removeAfter: 5000,
          });
        }
        return [state];
      }

      case "didMakeLocalAvatar": {
        const localParticipant = state.participants.get(playerId);
        localParticipant.avatar = msg.avatar;
        localParticipant.identityData.appearance;
        localParticipant.identityData.clientId = state.worldDoc.ydoc.clientID;

        return [
          { ...state, localAvatarInitialized: true },
          Cmd.ofMsg<Message>({ id: "initWorldManager" }),
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
            editable: false, // can't edit other participants
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

      // does not happen on initial page load; `enterPortal` is
      // used as the first stage of re-initializing everything for
      // a new relm, without reloading the web page
      case "enterPortal": {
        exists(msg.relmName, "relmName");
        exists(msg.entryway, "entryway");

        return [
          {
            ...state,
            overlayScreen: "portal",
            pageParams: {
              ...state.pageParams,
              relmName: msg.relmName,
              entryway: msg.entryway,
            },
            entrywayPosition: null,
            initializedWorldManager: false,
            worldDoc: null,
            ecsWorld: null,
          },
          (dispatch) => {
            worldManager
              .deinit()
              .then(() => {
                dispatch({ id: "didResetWorld" });
              })
              .catch((err) => {
                dispatch({ id: "error", msg: err.message });
              });
          },
        ];
      }

      case "didResetWorld": {
        exists(state.pageParams, "pageParams");
        exists(state.authHeaders, "authHeaders");

        return [
          state,
          getRelmPermitsAndMetadata(state.pageParams, state.authHeaders),
        ];
      }

      case "importedPhysicsEngine": {
        exists(msg.physicsEngine, "physicsEngine");

        return [
          {
            ...state,
            physicsEngine: msg.physicsEngine,
          },
          createECSWorld(msg.physicsEngine),
        ];
      }

      case "createdECSWorld": {
        exists(state.relmDocId, "relmDocId");
        exists(state.authHeaders, "authHeaders");
        exists(msg.ecsWorld, "ecsWorld");
        exists(msg.ecsWorldLoaderUnsub, "ecsWorldLoaderUnsub");

        return [
          {
            ...state,
            ecsWorld: msg.ecsWorld,
            ecsWorldLoaderUnsub: msg.ecsWorldLoaderUnsub,
          },
          createWorldDoc(msg.ecsWorld, state.relmDocId, state.authHeaders),
        ];
      }

      case "createdWorldDoc": {
        exists(state.ecsWorld, "ecsWorld");
        exists(msg.worldDoc, "worldDoc");

        return [
          {
            ...state,
            worldDoc: msg.worldDoc,
            entitiesCount: 0,
            assetsCount: 0,
          },
          Cmd.batch([
            Cmd.ofMsg<Message>({ id: "loading" }),

            // Initialize the Participant Program
            subscribeBroker(msg.worldDoc, state.ecsWorld, state.participants),
          ]),
        ];
      }

      case "didSubscribeBroker": {
        state.unsubs.push(msg.unsub);
        return [{ ...state, broker: msg.broker }];
      }

      case "gotWorldDocStatus": {
        exists(msg.status, "status");

        return [{ ...state, worldDocStatus: msg.status }];
      }

      case "setUpAudioVideo": {
        return [{ ...state, screen: "video-mirror" }];
      }

      case "didSetUpAudioVideo": {
        if (msg.audioDesired !== undefined) {
          state.audioDesired.set(msg.audioDesired);
        }
        if (msg.videoDesired !== undefined) {
          state.videoDesired.set(msg.videoDesired);
        }
        if (msg.preferredDeviceIds !== undefined) {
          state.preferredDeviceIds.set(msg.preferredDeviceIds);
        }

        const effects = [
          joinAudioVideo(
            state.participants.get(playerId),
            state.avConnection,
            state.avDisconnect,
            get(state.audioDesired),
            get(state.videoDesired),
            state.relmDocId,
            state.twilioToken
          ) as Function,
        ];

        const newState = { ...state, audioVideoSetupDone: true };

        if (state.initializedWorldManager) {
          effects.push(Cmd.ofMsg<Message>({ id: "startPlaying" }));
        } else {
          effects.push(nextSetupStep(newState));
        }

        return [newState, Cmd.batch(effects)];
      }

      case "didJoinAudioVideo": {
        return [{ ...state, avDisconnect: msg.avDisconnect }];
      }

      case "setUpAvatar": {
        return [{ ...state, screen: "choose-avatar" }];
      }

      case "didSetUpAvatar": {
        const localParticipant = state.participants.get(playerId);

        const newState: State = {
          ...state,
          avatarSetupDone: true,
        };

        askAvatarSetup.set(false);

        const effects = [nextSetupStep(newState)];

        if (state.participantName) {
          localParticipant.editable = false;
          effects.push(
            updateLocalParticipant(localParticipant, {
              name: state.participantName,
            }) as any
          );
        }

        if (msg.appearance) {
          effects.push(
            updateLocalParticipant(localParticipant, {
              appearance: msg.appearance,
            }) as any
          );
        }

        return [newState, Cmd.batch(effects)];
      }

      case "loading": {
        if (
          state.worldDoc &&
          state.audioVideoSetupDone &&
          state.avatarSetupDone
        ) {
          return [
            { ...state, doneLoading: false, screen: "loading-screen" },
            pollLoadingState(state),
          ];
        } else {
          return [state];
        }
      }

      case "gotLoadingState": {
        return [
          {
            ...state,
            assetsCount: msg.assetsCount,
            entitiesCount: msg.entitiesCount,
          },
        ];
      }

      case "loaded": {
        return [
          { ...state, doneLoading: true },
          Cmd.batch([
            getPositionFromEntryway(state.worldDoc, state.pageParams.entryway),
            (dispatch) => {
              // If we can't find the entryway in 1.5 sec, assume there is
              // no entryway data to be found, and use 0,0,0 as entryway
              setTimeout(() => {
                dispatch({ id: "assumeOriginAsEntryway" });
              }, 1500);
            },
          ]),
        ];
      }

      case "gotPositionFromEntryway": {
        exists(msg.entrywayPosition, "entrywayPosition");

        return [
          {
            ...state,
            entrywayPosition: msg.entrywayPosition,
          },
          Cmd.ofMsg<Message>({ id: "gotEntrywayPosition" }),
        ];
      }

      case "assumeOriginAsEntryway": {
        if (!state.entrywayPosition) {
          alert("This relm's default entryway is not yet set.");
          return [
            { ...state, entrywayPosition: new Vector3(0, 0, 0) },
            Cmd.ofMsg<Message>({ id: "gotEntrywayPosition" }),
          ];
        } else {
          return [state];
        }
      }

      case "gotEntrywayPosition": {
        const localParticipant = state.participants.get(playerId);
        return [
          state,
          makeLocalAvatar(
            localParticipant,
            state.ecsWorld,
            state.entrywayPosition,
            state.worldDoc.ydoc.clientID,
            get(state.videoDesired),
            get(state.audioDesired)
          ),
        ];
      }

      case "initWorldManager": {
        if (
          // Command sent from gotEntrywayPosition
          state.entrywayPosition &&
          // .. and also sent from our intercepted `didMakeLocalAvatar` updater
          state.localAvatarInitialized
        ) {
          // Stop making the world "tick" just for loading
          state.ecsWorldLoaderUnsub?.();

          exists(state.avConnection, "avConnection");

          return [
            state,
            initWorldManager(
              state,
              state.broker,
              state.ecsWorld,
              state.worldDoc,
              state.pageParams,
              state.relmDocId,
              state.avConnection,
              state.participants
            ),
          ];
        } else {
          return [state];
        }
      }

      case "didInitWorldManager": {
        return [
          { ...state, initializedWorldManager: true },
          Cmd.ofMsg<Message>({ id: "loadedAndReady" }),
        ];
      }

      case "loadedAndReady": {
        if (state.entrywayPosition && state.doneLoading) {
          worldManager.moveTo(state.entrywayPosition);

          if (state.entrywayUnsub) {
            state.entrywayUnsub();
          }

          return [
            { ...state, entrywayUnsub: null },
            Cmd.ofMsg<Message>({ id: "startPlaying" }),
          ];
        } else {
          return [state];
        }
      }

      case "startPlaying":
        return [
          { ...state, overlayScreen: null, screen: "game-world" },
          Cmd.ofMsg<Message>({ id: "join" }),
        ];

      // We store entrywayUnsub for later when we may need it for a portal
      case "gotEntrywayUnsub": {
        return [{ ...state, entrywayUnsub: msg.entrywayUnsub }];
      }

      case "gotNotificationContext": {
        return [{ ...state, notifyContext: msg.notifyContext }];
      }

      // Error page to show what went wrong
      case "error":
        console.warn(msg.message, msg.stack);
        return [{ ...state, screen: "error", errorMessage: msg.message }];

      default:
        console.warn("Unknown relm message:", msg);
        return [state];
    }
  };

  const view = (state, dispatch) => {
    if (logEnabled) console.log("relmProgram view", state.screen);
    if (state)
      switch (state.screen) {
        case "initial":
          return [BlankWithLogo];
        case "error":
          return [
            ErrorScreen,
            { message: state.errorMessage || "There was an error" },
          ];
        case "video-mirror":
          return [
            MediaSetupShim,
            {
              dispatch,
              audioDesired: get(state.audioDesired),
              videoDesired: get(state.videoDesired),
              preferredDeviceIds: get(state.preferredDeviceIds),
            },
          ];
        case "choose-avatar":
          return [AvatarChooser, { dispatch }];
        case "loading-screen":
          return [
            LoadingScreen,
            {
              dispatch,
              entitiesCount: state.entitiesCount,
              entitiesMax: state.entitiesMax,
              assetsCount: state.assetsCount,
              assetsMax: state.assetsMax,
            },
          ];
        case "loading-failed":
          return [LoadingFailed];
        case "game-world":
          return [
            GameWorld,
            {
              dispatch,
              ecsWorld: state.ecsWorld,
              permits: state.permits,
              overlayScreen: state.overlayScreen,
              state,
            },
          ];
        default:
          throw Error(`Unknown screen: ${state.screen}`);
      }
  };
  return { init, update, view };
}
