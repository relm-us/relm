import { get } from "svelte/store";
import { Vector3 } from "three";

import Program from "./Program.svelte";
import { Cmd } from "~/utils/runtime";
import { RelmState, RelmMessage } from "./RelmStateAndMessage";

import BlankWithLogo from "./BlankWithLogo.svelte";
import MediaSetupShim from "./MediaSetupShim.svelte";
import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";
import { resetLoading, startPollingLoadingState } from "~/stores/loading";

import { loadPreferredDeviceIds } from "~/av/loadPreferredDeviceIds";

import GameWorld from "./GameWorld.svelte";
import ErrorScreen from "./ErrorScreen.svelte";

import { getParticipantAndRelm } from "./effects/getParticipantAndRelmName";
import { getRelmPermitsAndMetadata } from "./effects/getRelmPermitsAndMetadata";
import { importPhysicsEngine } from "./effects/importPhysicsEngine";
import { nextSetupStep } from "./effects/nextSetupStep";
import { createWorldDoc } from "./effects/createWorldDoc";

import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";

import { worldManager } from "~/world";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("program");

export const relmProgram = {
  init: [{ screen: "initial" }, Cmd.ofMsg({ id: "pageLoaded" })],
  update(msg: RelmMessage, state: RelmState): [RelmState, any?] {
    if (logEnabled)
      console.log(`program msg '${msg.id}' (${state.relmName}): %o`, { state });

    switch (msg.id) {
      case "pageLoaded": {
        return [state, getParticipantAndRelm];
      }

      case "enterPortal": {
        return [
          {
            ...state,
            overlayScreen: "portal",
            relmName: msg.relmName,
            entryway: msg.entryway,
          },
          (dispatch) => {
            worldManager
              .deinit()
              .then(() => {
                dispatch({ id: "worldDidReset" });
              })
              .catch((err) => {
                dispatch({ id: "error", msg: err.message });
              });
          },
        ];
      }

      case "worldDidReset": {
        return [
          { ...state, worldDoc: null },
          getRelmPermitsAndMetadata(state.relmName),
        ];
      }

      case "gotParticipantAndRelm": {
        return [
          {
            ...state,
            participantId: msg.participantId,
            secureParams: msg.secureParams,
            relmName: msg.relmName,
            entryway: msg.entryway,
          },
          getRelmPermitsAndMetadata(msg.relmName),
        ];
      }

      case "gotRelmPermitsAndMetadata": {
        if (!msg.permits || !msg.permits.includes("access")) {
          return [
            state,
            Cmd.ofMsg({ id: "error", message: `Permission not granted` }),
          ];
        }
        return [
          {
            ...state,
            permits: msg.permits,
            relmDocId: msg.relmDocId,
            entitiesMax: msg.entitiesMax,
            assetsMax: msg.assetsMax,
            twilioToken: msg.twilioToken,
          },
          // Kick off parallel loading physics, ECS, worldDoc;
          // meanwhile, set up audio/video and avatar if needed
          Cmd.batch([importPhysicsEngine, nextSetupStep(state)]),
        ];
      }

      case "importedPhysicsEngine": {
        const newState = {
          ...state,
          physicsEngine: msg.physicsEngine,
        };
        return [
          newState,
          Cmd.batch([
            (dispatch) => {
              resetLoading(newState.assetsMax, newState.entitiesMax);
            },
            createWorldDoc(newState),
          ]),
        ];
      }

      case "createdWorldDoc": {
        return [
          { ...state, ecsWorld: msg.ecsWorld, worldDoc: msg.worldDoc },
          Cmd.ofMsg({ id: "loading" }),
        ];
      }

      case "gotEntrywayPosition": {
        return [
          {
            ...state,
            entrywayPosition: msg.entrywayPosition,
          },
          Cmd.ofMsg({ id: "loadedAndReady" }),
        ];
      }

      case "gotEntrywayUnsub": {
        return [{ ...state, entrywayUnsub: msg.entrywayUnsub }];
      }

      case "configureAudioVideo": {
        return [
          {
            ...state,
            audioDesired: get(audioDesired),
            videoDesired: get(videoDesired),
            preferredDeviceIds: loadPreferredDeviceIds(),
            screen: "video-mirror",
          },
        ];
      }

      case "configuredAudioVideo": {
        let newState = { ...state, audioVideoSetupDone: true };
        if (msg.state) {
          newState.audioDesired = msg.state.audioDesired;
          newState.videoDesired = msg.state.videoDesired;
          newState.preferredDeviceIds = msg.state.preferredDeviceIds;
        } else {
          newState.audioDesired = false;
          newState.videoDesired = false;
        }

        // Save program state into svelte stores
        audioDesired.set(newState.audioDesired);
        videoDesired.set(newState.videoDesired);
        localStorage.setItem(
          "preferredDeviceIds",
          JSON.stringify(newState.preferredDeviceIds)
        );

        return [newState, nextSetupStep(newState)];
      }

      case "chooseAvatar": {
        return [{ ...state, screen: "choose-avatar" }];
      }

      case "choseAvatar":
        const newState: RelmState = {
          ...state,
          avatarSetupDone: true,
          appearance: msg.appearance,
        };
        return [newState, nextSetupStep(newState)];

      case "loading": {
        if (
          state.worldDoc &&
          state.audioVideoSetupDone &&
          state.avatarSetupDone
        ) {
          return [
            { ...state, doneLoading: false, screen: "loading-screen" },
            (dispatch) => {
              startPollingLoadingState(state.worldDoc, () => {
                setTimeout(() => {
                  dispatch({ id: "assumeOriginAsEntryway" });
                }, 1500);
                dispatch({ id: "loaded" });
              });
            },
          ];
        } else {
          return [state];
        }
      }

      case "loaded": {
        return [
          { ...state, doneLoading: true },
          Cmd.ofMsg({ id: "loadedAndReady" }),
        ];
      }

      case "assumeOriginAsEntryway": {
        if (!state.entrywayPosition) {
          alert("This relm's default entryway is not yet set.");
          return [
            { ...state, entrywayPosition: new Vector3(0, 0, 0) },
            Cmd.ofMsg({ id: "loaded" }),
          ];
        } else {
          return [state];
        }
      }

      case "loadedAndReady": {
        if (state.entrywayPosition && state.doneLoading) {
          worldManager.avatar.moveTo(state.entrywayPosition);

          if (state.appearance) {
            worldManager.identities.me.set({ appearance: state.appearance });
          }

          if (state.entrywayUnsub) {
            state.entrywayUnsub();
          }

          return [
            { ...state, entrywayUnsub: null },
            Cmd.ofMsg({ id: "startPlaying" }),
          ];
        } else {
          return [state];
        }
      }

      case "startPlaying":
        return [{ ...state, overlayScreen: null, screen: "game-world" }];

      case "error":
        return [{ ...state, screen: "error", errorMessage: msg.message }];

      default:
        console.warn("Unknown relm message:", msg);
        return [state];
    }
  },

  view(state, dispatch) {
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
              audioDesired: state.audioDesired,
              videoDesired: state.videoDesired,
              preferredDeviceIds: state.preferredDeviceIds,
            },
          ];
        case "choose-avatar":
          return [AvatarChooser, { dispatch }];
        case "loading-screen":
          return [LoadingScreen, { dispatch }];
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
            },
          ];
        default:
          throw Error(`Unknown screen: ${state.screen}`);
      }
  },
};

const app = new Program({
  target: document.body,
  props: { createApp: (props) => relmProgram },
});

export default app;
