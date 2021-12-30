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

import { identifyParticipant } from "./identifyParticipant";
import { initializeECS } from "./initializeECS";
import { locateSubrelm } from "./locateSubrelm";
import { getPermits } from "./getPermits";
import { getMetadata } from "./getMetadata";
import { connectYjs } from "./connectYjs";

import { WorldDoc } from "~/y-integration/WorldDoc";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { initializeWorldManager } from "./initializeWorldManager";
import { worldManager } from "~/world";
import { importPhysicsEngine } from "./importPhysicsEngine";
import { mediaDesired } from "video-mirror";

export const relmProgram = {
  init: [{ screen: "initial" }, identifyParticipant],
  update(msg: RelmMessage, state: RelmState) {
    console.log("relmProgram update", msg);
    switch (msg.id) {
      case "error":
        return [{ ...state, screen: "error", errorMessage: msg.message }];

      case "identified":
        mediaDesired.set(
          JSON.parse(
            localStorage.getItem("mediaDesired") ||
              '{"audio":true,"video":true}'
          )
        );
        return [
          {
            ...state,
            playerId: msg.playerId,
            secureParams: msg.secureParams,
          },
          importPhysicsEngine,
        ];

      case "importedPhysicsEngine":
        return [
          {
            ...state,
            physicsEngine: msg.physicsEngine,
          },
          initializeECS(msg.physicsEngine),
        ];

      case "changeSubrelm":
        worldManager.reset();
        return [
          {
            playerId: state.playerId,
            secureParams: state.secureParams,
            physicsEngine: state.physicsEngine,
            changingSubrelm: true,
            subrelm: msg.subrelm,
            entryway: msg.entryway,
            screen: "loading-screen",
          },
          initializeECS(state.physicsEngine),
        ];

      case "initializedECS":
        if (state.subrelm && state.entryway) {
          return [
            { ...state, ecsWorld: msg.ecsWorld },
            Cmd.batch([getPermits(state.subrelm), getMetadata(state.subrelm)]),
          ];
        } else {
          return [{ ...state, ecsWorld: msg.ecsWorld }, locateSubrelm];
        }

      case "gotSubrelm":
        return [
          { ...state, subrelm: msg.subrelm, entryway: msg.entryway },
          Cmd.batch([getPermits(msg.subrelm), getMetadata(msg.subrelm)]),
        ];

      case "gotPermits":
        if (msg.permits && msg.permits.length > 0) {
          return [
            { ...state, permits: msg.permits },
            Cmd.ofMsg({ id: "combinePermitsAndMetadata" }),
          ];
        } else {
          return [
            state,
            Cmd.ofMsg({ id: "error", message: `Permission not granted` }),
          ];
        }

      case "gotMetadata":
        resetLoading(msg.assetsCount, msg.entitiesCount);
        return [
          {
            ...state,
            subrelmDocId: msg.subrelmDocId,
            entitiesMax: msg.entitiesCount,
            entitiesCount: 0,
            assetsMax: msg.assetsCount,
            assetsCount: 0,
            twilioToken: msg.twilioToken,
          },
          Cmd.ofMsg({ id: "combinePermitsAndMetadata" }),
        ];

      case "combinePermitsAndMetadata":
        // Wait until both permits & metadata are available
        if (state.permits && state.subrelmDocId) {
          console.log("combine state", state);
          state.worldDoc = new WorldDoc(state.ecsWorld);
          return [
            { ...state },
            Cmd.batch([
              initializeWorldManager(state),
              connectYjs(
                state.worldDoc,
                state.subrelmDocId,
                state.secureParams
              ),
            ]),
          ];
        } else {
          return [state];
        }

      case "connectedYjs": {
        return [state, Cmd.ofMsg({ id: "configuredAudioVideo" })];
        // const ask = get(askMediaSetup);
        // if (ask && !state.changingSubrelm) {
        //   return [state, Cmd.ofMsg({ id: "setupAudioVideo", respectSkip: true })];
        // } else {
        // }
      }

      case "setupAudioVideo": {
        const skip = get(askMediaSetup) === false && msg.respectSkip;
        if (skip) {
          mediaDesired.set({ audio: false, video: false });
          return [{ ...state }, Cmd.ofMsg({ id: "configuredAudioVideo" })];
        } else {
          return [{ ...state, screen: "video-mirror" }];
        }
      }

      case "configuredAudioVideo": {
        localStorage.setItem("mediaDesired", JSON.stringify(get(mediaDesired)));
        const ask = get(askAvatarSetup);
        if (ask) {
          return [{ ...state, screen: "choose-avatar" }];
        } else {
          return [state, Cmd.ofMsg({ id: "startPlaying" })];
        }
      }

      case "choseAvatar":
        return [
          { ...state, screen: "loading-screen" },
          (dispatch) => {
            startPollingLoadingState(state.worldDoc, () => {
              dispatch({ id: "startPlaying" });
            });
          },
        ];

      case "startPlaying":
        return [{ ...state, screen: "game-world" }];

      default:
        return [state];
    }
  },

  view(state, dispatch) {
    console.log("relmProgram view", state.screen);
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
          return [MediaSetupShim, { dispatch }];
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
              buildModeAllowed: state.permits.includes("edit"),
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
