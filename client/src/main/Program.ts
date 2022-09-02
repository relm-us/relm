import { get, Writable } from "svelte/store";
import { Vector3 } from "three";

import { DeviceIds } from "video-mirror";

import { worldManager } from "~/world";

import { Cmd } from "~/utils/runtime";
import { exists } from "~/utils/exists";
import { isEqual } from "~/utils/isEqual";

import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";

import { AVConnection } from "~/av/AVConnection";
import { AV_ENABLED } from "~/config/constants";

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
import { resetArrowKeys } from "./effects/resetArrowKeys";
import { requestCloneRelm } from "./effects/requestCloneRelm";

import GameWorld from "./views/GameWorld.svelte";
import ErrorScreen from "./views/ErrorScreen.svelte";
import BlankWithLogo from "./views/BlankWithLogo.svelte";
import MediaSetupShim from "./views/MediaSetupShim.svelte";
import LoadingScreen from "./views/LoadingScreen.svelte";
import LoadingFailed from "./views/LoadingFailed.svelte";

import { participantId } from "~/identity/participantId";
import { participantRemoveAvatar } from "~/identity/ParticipantManager";
import { setAvatarFromParticipant } from "~/identity/Avatar/setAvatarFromParticipant";
import { getDefaultAppearance } from "~/identity/Avatar/appearance";
import { localIdentityData } from "~/stores/identityData";
import { IdentityData, UpdateData } from "~/types";
import { Oculus } from "~/ecs/plugins/html2d";
import { getIdentityData } from "./effects/getIdentityData";
import { saveIdentityData } from "./effects/saveIdentityData";
import { connectedAccount } from "~/stores/connectedAccount";
import { permits } from "~/stores/permits";
import { Security } from "~/../../common/dist";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("program");

const send: (msg: Message) => Effect = Cmd.ofMsg;

/**
 * The main Relm program
 */
export function makeProgram(): Program {
  const globalBroadcast = window.BroadcastChannel
    ? new BroadcastChannel("relm.us")
    : null;

  const init: [State, Effect] = [
    {
      globalBroadcast,
      worldDocStatus: "disconnected",
      screen: "initial",

      participants: initParticipants(),
      localAvatarInitialized: false,
      localIdentityData: localIdentityData as Writable<IdentityData>,
      preferredDeviceIds: preferredDeviceIds as Writable<DeviceIds>,
    },
    getPageParams(globalBroadcast),
  ];

  const update = (msg: Message, state: State): [State, any?] => {
    (window as any).state = state;
    if (logEnabled) {
      console.log(
        `program msg '${msg.id}' (${state.pageParams?.relmName}): %o`,
        {
          msg,
          state,
        }
      );
    }

    if (state.screen === "error") {
      // stay in error state
      return;
    }

    // Handle Program updates
    switch (msg.id) {
      case "gotPageParams": {
        exists(msg.pageParams);

        // Hack to make state available to worldManager as soon as possible (debugging)
        worldManager.state = state;

        const security = new Security({
          getSecret: () => JSON.parse(localStorage.getItem("secret") ?? "null"),
          setSecret: (secret) =>
            localStorage.setItem("secret", JSON.stringify(secret)),
        });

        return [
          { ...state, pageParams: msg.pageParams, security },
          getAuthenticationHeaders(msg.pageParams, security),
        ];
      }

      case "gotAuthenticationHeaders": {
        exists(msg.authHeaders);

        return [
          {
            ...state,
            authHeaders: msg.authHeaders,
            avConnection: new AVConnection(participantId),
          },
          getIdentityData(state.pageParams, msg.authHeaders),
        ];
      }
      case "gotIdentityData": {
        const newIdentityData: IdentityData = {
          ...get(state.localIdentityData),
        };
        if (msg.identity) {
          newIdentityData.name = msg.identity.name;
          newIdentityData.color = msg.identity.color;
          newIdentityData.appearance = msg.identity.appearance;
          if (msg.identity.appearance) {
            state.avatarSetupDone = true;
          }

          newIdentityData.equipment = msg.identity.equipment;
          newIdentityData.status = msg.identity.status;
        }

        state.localIdentityData.set(newIdentityData);
        connectedAccount.set(msg.isConnected);

        return [
          {
            ...state,
          },
          getRelmPermitsAndMetadata(state.pageParams, state.authHeaders),
        ];
      }

      case "gotRelmPermitsAndMetadata": {
        exists(msg.permits, "permits");
        exists(msg.relmDocId, "relmDocId");
        exists(msg.entitiesMax, "entitiesMax");
        exists(msg.assetsMax, "assetsMax");
        exists(msg.twilioToken, "twilioToken");

        permits.set(msg.permits);

        return [
          {
            ...state,
            overrideParticipantName: msg.overrideParticipantName,
            relmDocId: msg.relmDocId,
            entitiesMax: msg.entitiesMax,
            assetsMax: msg.assetsMax,
            twilioToken: msg.twilioToken,
          },

          state.pageParams.isCloneRequest
            ? requestCloneRelm(state.pageParams, state.authHeaders)
            : // Kick off parallel tasks:
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

      case "removeParticipant": {
        for (let [participantId, participant] of state.participants) {
          if (participant.identityData.clientId === msg.clientId) {
            participantRemoveAvatar(participant);
          }
        }

        // TODO: leave video conference if participants <= 1

        return [state];
      }

      case "participantJoined": {
        const name = msg.participant.identityData.name;
        if (state.notifyContext) {
          state.notifyContext.addNotification({
            text: `${name && name !== "" ? name : "A newcomer"} joined.`,
            position: "bottom-center",
            removeAfter: 5000,
          });
        }

        console.log(
          "participantJoined",
          msg.participant.identityData.name,
          state.participants.size
        );

        let nextAction = joinAudioVideo(
          state.participants.get(participantId),
          state.avConnection,
          state.avDisconnect,
          state.relmDocId,
          state.twilioToken
        );

        if (AV_ENABLED === false) {
          // The audio/video system is completely disabled
          nextAction = null;
        }

        if (state.avDisconnect) {
          // We've already connected once, no need to do it again
          nextAction = null;
        }

        return [state, nextAction];
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
        const localParticipant = state.participants.get(participantId);

        // If name is assigned (e.g. via JWT), it can't be changed
        localParticipant.editable = state.overrideParticipantName === undefined;

        const newIdentityData = {
          ...get(state.localIdentityData),
          ...msg.identityData,
        };

        // Check if we updated the identity data
        const isNewIdentityUpdate = !isEqual(
          newIdentityData,
          get(state.localIdentityData)
        );

        // Do we need to update the identity data to other participants?
        if (isNewIdentityUpdate) {
          // update identityData on participant
          Object.assign(localParticipant.identityData, newIdentityData);

          // update identityData in Program state & Svelte store
          state.localIdentityData.set(newIdentityData);

          // broadcast identityData to other participants
          state.broker.setField("i", newIdentityData);

          // sync identityData to HTML and ECS entities
          setAvatarFromParticipant(localParticipant);
        }

        // Save identity data to server if necessary
        if (get(connectedAccount)) {
          return [state, saveIdentityData(state)];
        } else {
          return [state];
        }
      }

      // does not happen on initial page load; `enterPortal` is
      // used as the first stage of re-initializing everything for
      // a new relm, without reloading the web page
      case "enterPortal": {
        exists(msg.relmName, "relmName");
        exists(msg.entryway, "entryway");

        worldManager.stop();
        state.avDisconnect?.();

        return [
          {
            ...state,
            // Release all svelte timers etc.
            screen: "loading-screen",
            pageParams: {
              ...state.pageParams,
              relmName: msg.relmName,
              entryway: msg.entryway,
            },

            // Show empty progress bar; values to be updated later
            entitiesCount: 0,
            entitiesMax: 1,
            assetsCount: 0,
            assetsMax: 1,

            participants: initParticipants(),
            entrywayPosition: null,
            initializedWorldManager: false,
            worldDoc: null,
            ecsWorld: null,
            avDisconnect: null,
          },
          send({ id: "didEnterPortal" }),
        ];
      }

      case "didEnterPortal": {
        return [
          state,

          (dispatch) => {
            worldManager
              .deinit()
              .then(() => {
                dispatch({ id: "didResetWorld" });
              })
              .catch((err) => {
                console.warn(err);
                dispatch({ id: "error", msg: err.toString() });
              });
          },
        ];
      }

      case "didResetWorld": {
        exists(state.pageParams, "pageParams");
        exists(state.authHeaders, "authHeaders");

        return [
          state,
          Cmd.batch([
            getAuthenticationHeaders(state.pageParams, state.security),
            resetArrowKeys,
          ]),
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
        if (state.worldDoc) {
          console.warn("Creating new worldDoc, but one already exists");
        }
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
            send({ id: "loadStart" }),

            // Initialize the Participant Program
            subscribeBroker(msg.worldDoc, state.ecsWorld, state.participants),
          ]),
        ];
      }

      case "didSubscribeBroker": {
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
          state.initialAudioDesired = msg.audioDesired;
        }
        if (msg.videoDesired !== undefined) {
          state.initialVideoDesired = msg.videoDesired;
        }
        if (msg.preferredDeviceIds !== undefined) {
          state.preferredDeviceIds.set(msg.preferredDeviceIds);
        }

        const effects: Effect[] = [];

        const newState = { ...state, audioVideoSetupDone: true };

        if (state.initializedWorldManager) {
          // After visiting the video-mirror screen, each Svelte Video component
          // except the local video loses its feed, so we need to remove/add
          // each one back:
          state.ecsWorld.entities
            .getAllByComponent(Oculus)
            .forEach((entity) => {
              entity.get(Oculus).modified();
            });

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

      case "loadStart": {
        if (
          state.worldDoc &&
          state.audioVideoSetupDone &&
          state.avatarSetupDone
        ) {
          return [
            { ...state, doneLoading: false, screen: "loading-screen" },
            send({ id: "loadPoll" }),
          ];
        } else {
          return [state];
        }
      }

      case "loadPoll": {
        return [state, pollLoadingState(state)];
      }

      case "loadComplete": {
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

      case "gotLoadingState": {
        return [
          {
            ...state,
            assetsCount: msg.assetsCount,
            entitiesCount: msg.entitiesCount,
          },
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

        state.participants.get(participantId).avatar = msg.avatar;

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
              state.participants,
              state.security
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
        const data = get(state.localIdentityData);
        const identityData: UpdateData = {
          clientId: state.worldDoc.ydoc.clientID,
          status: "present",
          name: state.overrideParticipantName || data.name,
          showAudio: state.initialAudioDesired,
          showVideo: state.initialVideoDesired,
          speaking: false,
          appearance:
            state.participantQuickAppearance ||
            data.appearance ||
            // If we've completely lost appearance somehow, scrape
            // a default together
            getDefaultAppearance("male"),
        };
        if (state.participantQuickAppearance) {
          identityData.appearance = state.participantQuickAppearance;
        }
        return [
          { ...state, screen: "game-world" },
          send({ id: "updateLocalIdentityData", identityData }),
        ];

      // We store entrywayUnsub for later when we may need it for a portal
      case "gotEntrywayUnsub": {
        return [{ ...state, entrywayUnsub: msg.entrywayUnsub }];
      }

      // Store context so Program can send notifications via svelte-notifications
      case "gotNotificationContext": {
        return [{ ...state, notifyContext: msg.notifyContext }];
      }

      case "notify": {
        state.notifyContext.addNotification({
          text: msg.notification,
          position: "bottom-center",
          removeAfter: 5000,
        });
        return [state];
      }

      // Send yjs a modification so that it triggers an assets/entities stats re-assessment
      case "recomputeWorldDocStats": {
        if (state.worldDoc) {
          state.worldDoc.recomputeStats();
        } else {
          console.warn("Can't recompute stats, worldDoc not available");
        }
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
              state,
            },
          ];
        default:
          throw Error(`Unknown screen: ${state.screen}`);
      }
  };
  return { init, update, view };
}
