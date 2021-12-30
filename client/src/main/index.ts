import { get } from "svelte/store";

import Program from "./Program.svelte";
import * as Cmd from "./Cmd";
import { RelmState, RelmMessage } from "./RelmStateAndMessage";

import BlankWithLogo from "./BlankWithLogo.svelte";
import MediaSetupShim from "./MediaSetupShim.svelte";
import AvatarChooserShim from "./AvatarChooserShim.svelte";
import GameWorldShim from "./GameWorldShim.svelte";
import ErrorScreen from "./ErrorScreen.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";
import { resetLoading, startPollingLoadingState } from "~/stores/loading";

import { getParticipantAndRelm } from "./effects/getParticipantAndRelmName";
import { getRelmPermitsAndMetadata } from "./effects/getRelmPermitsAndMetadata";
import { importPhysicsEngine } from "./effects/importPhysicsEngine";
import { nextSetupStep } from "./effects/nextSetupStep";
import { createWorldDoc } from "./effects/createWorldDoc";

import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";

import { worldManager } from "~/world";

export const relmProgram = {
  init: [{ screen: "initial" }, Cmd.ofMsg({ id: "pageLoaded" })],
  update(msg: RelmMessage, state: RelmState) {
    // console.log("got RelmMessage:", msg);

    switch (msg.id) {
      case "pageLoaded": {
        return [state, getParticipantAndRelm];
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
            entitiesCount: msg.entitiesCount,
            assetsCount: msg.assetsCount,
            twilioToken: msg.twilioToken,
          },
          // Kick off parallel loading physics, ECS, worldDoc;
          // meanwhile, set up audio/video and avatar if needed
          Cmd.batch([importPhysicsEngine, nextSetupStep(state)]),
        ];
      }

      case "importedPhysicsEngine": {
        return [
          {
            ...state,
            physicsEngine: msg.physicsEngine,
          },
          createWorldDoc(
            msg.physicsEngine,
            state.relmName,
            state.entryway,
            state.relmDocId,
            state.secureParams,
            state.twilioToken
          ),
        ];
      }

      case "createdWorldDoc": {
        return [
          { ...state, ecsWorld: msg.ecsWorld, worldDoc: msg.worldDoc },
          // loadAssets
          Cmd.ofMsg({ id: "loadedAndReady" }),
        ];
      }

      case "configureAudioVideo": {
        return [
          {
            ...state,
            audioDesired: get(audioDesired),
            videoDesired: get(videoDesired),
            preferredDeviceIds: JSON.parse(
              localStorage.getItem("preferredDeviceIds") || "{}"
            ),
            screen: "video-mirror",
          },
        ];
      }

      case "configuredAudioVideo": {
        let newState;
        if (msg.state) {
          audioDesired.set(msg.state.audioDesired);
          videoDesired.set(msg.state.videoDesired);
          localStorage.setItem(
            "preferredDeviceIds",
            JSON.stringify(msg.state.preferredDeviceIds)
          );
          newState = {
            ...state,
            audioVideoSetupDone: true,
            audioDesired: msg.state.audioDesired,
            videoDesired: msg.state.videoDesired,
            preferredDeviceIds: msg.state.preferredDeviceIds,
          };
        } else {
          audioDesired.set(false);
          videoDesired.set(false);
          newState = { ...state, audioVideoSetupDone: true };
        }
        return [newState, nextSetupStep(newState)];
      }

      case "chooseAvatar": {
        return [{ ...state, screen: "choose-avatar" }];
      }

      case "choseAvatar":
        const newState: RelmState = {
          ...state,
          avatarSetupDone: true,
          screen: "loading-screen",
        };
        return [
          newState,

          (dispatch) => {
            startPollingLoadingState(state.worldDoc, () => {
              nextSetupStep(newState)(dispatch);
            });
          },
        ];

      case "loadedAndReady": {
        if (
          state.worldDoc &&
          state.audioVideoSetupDone &&
          state.avatarSetupDone
        ) {
          return [state, Cmd.ofMsg({ id: "startPlaying" })];
        } else {
          return [state];
        }
      }

      case "startPlaying":
        return [{ ...state, screen: "game-world" }];

      case "error":
        return [{ ...state, screen: "error", errorMessage: msg.message }];

      default:
        console.warn("Unknown relm message:", msg);
        return [state];
    }
  },

  view(state, dispatch) {
    // console.log("relmProgram view", state.screen);
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
          return [AvatarChooserShim, { dispatch }];
        case "loading-screen":
          return [LoadingScreen];
        case "loading-failed":
          return [LoadingFailed];
        case "game-world":
          return [
            GameWorldShim,
            {
              dispatch,
              ecsWorld: state.ecsWorld,
              permits: state.permits,
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
