import { get, Writable } from "svelte/store";
import { Vector3 } from "three";
import { DeviceIds } from "video-mirror";

import { worldManager } from "~/world";

import { Cmd } from "~/utils/runtime";
import { exists } from "~/utils/exists";

import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";

import { AVConnection } from "~/av/AVConnection";

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
import { setAvatarFromParticipant } from "~/identity/Avatar/setAvatarFromParticipant";
import { localIdentityData } from "~/stores/identityData";
import { IdentityData, UpdateData } from "~/types";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("program");

const send: (msg: Message) => Effect = Cmd.ofMsg;

/**
 * The main Relm program
 */
export function makeProgram(): Program {
  const init: [State, Effect] = [
    {
      worldDocStatus: "disconnected",
      screen: "initial",
      unsubs: [],

      participants: initParticipants(),
      localAvatarInitialized: false,
      localIdentityData: localIdentityData as Writable<IdentityData>,
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
            avConnection: new AVConnection(playerId),
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
            overrideParticipantName: msg.overrideParticipantName,
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
            editable: false, // can't edit other participants
            modified: true,
            /* no avatar yet, because this may be an inactive (stale) participant */
          });
        }

        return [state];
      }

      // Update local participant's IdentityData and send to other participants
      case "updateLocalIdentityData": {
        const localParticipant = state.participants.get(playerId);

        // If name is assigned (e.g. via JWT), it can't be changed
        localParticipant.editable = state.overrideParticipantName === undefined;

        const newIdentityData = {
          ...get(state.localIdentityData),
          ...msg.identityData,
        };

        // update identityData on participant
        Object.assign(localParticipant.identityData, newIdentityData);

        // update identityData in Program state & Svelte store
        state.localIdentityData.set(newIdentityData);

        // broadcast identityData to other participants
        state.broker.setIdentityData(playerId, newIdentityData);

        // sync identityData to HTML and ECS entities
        setAvatarFromParticipant(localParticipant);

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
            send({ id: "loading" }),

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
        console.log("didSetUpAudioVideo", msg);

        if (msg.audioDesired !== undefined) {
          state.initialAudioDesired = msg.audioDesired;
        }
        if (msg.videoDesired !== undefined) {
          state.initialVideoDesired = msg.videoDesired;
        }
        if (msg.preferredDeviceIds !== undefined) {
          state.preferredDeviceIds.set(msg.preferredDeviceIds);
        }

        const effects: Effect[] = [
          joinAudioVideo(
            state.participants.get(playerId),
            state.avConnection,
            state.avDisconnect,
            msg.audioDesired,
            msg.videoDesired,
            state.relmDocId,
            state.twilioToken
          ),
        ];

        const newState = { ...state, audioVideoSetupDone: true };

        if (state.initializedWorldManager) {
          effects.push(send({ id: "startPlaying" }));
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
        const newState: State = {
          ...state,
          avatarSetupDone: true,
          participantQuickAppearance: msg.appearance,
        };

        askAvatarSetup.set(false);

        return [newState, nextSetupStep(newState)];
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
          send({ id: "gotEntrywayPosition" }),
        ];
      }

      case "assumeOriginAsEntryway": {
        if (!state.entrywayPosition) {
          alert("This relm's default entryway is not yet set.");
          return [
            { ...state, entrywayPosition: new Vector3(0, 0, 0) },
            send({ id: "gotEntrywayPosition" }),
          ];
        } else {
          return [state];
        }
      }

      case "gotEntrywayPosition": {
        return [state, makeLocalAvatar(state.ecsWorld, state.entrywayPosition)];
      }

      case "didMakeLocalAvatar": {
        exists(msg.avatar, "avatar");

        state.participants.get(playerId).avatar = msg.avatar;

        return [
          { ...state, localAvatarInitialized: true },
          send({ id: "initWorldManager" }),
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
          send({ id: "loadedAndReady" }),
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
            send({ id: "startPlaying" }),
          ];
        } else {
          return [state];
        }
      }

      case "startPlaying":
        const identityData: UpdateData = {
          clientId: state.worldDoc.ydoc.clientID,
          name:
            state.overrideParticipantName || get(state.localIdentityData).name,
          showAudio: state.initialAudioDesired,
          showVideo: state.initialVideoDesired,
          speaking: false,
        };
        if (state.participantQuickAppearance) {
          identityData.appearance = state.participantQuickAppearance;
        }
        return [
          { ...state, overlayScreen: null, screen: "game-world" },
          Cmd.batch([
            send({ id: "updateLocalIdentityData", identityData }),
            send({ id: "join" }),
          ]),
        ];

      // We store entrywayUnsub for later when we may need it for a portal
      case "gotEntrywayUnsub": {
        return [{ ...state, entrywayUnsub: msg.entrywayUnsub }];
      }

      // Store context so Program can send notifications via svelte-notifications
      case "gotNotificationContext": {
        return [{ ...state, notifyContext: msg.notifyContext }];
      }

      // Send yjs a modification so that it triggers an assets/entities stats re-assessment
      case "recomputeWorldDocStats": {
        state.worldDoc?.recomputeStats();
        return [state];
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
