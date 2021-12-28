import { get } from "svelte/store";

import SvelteProgram from "./SvelteProgram.svelte";
import * as Cmd from "./Cmd"
import { RelmState, RelmMessage } from "./RelmStateAndMessage"

import BlankWithLogo from "./BlankWithLogo.svelte";
import MediaSetupShim from "./MediaSetupShim.svelte";
import AvatarChooserShim from "./AvatarChooserShim.svelte";
import GameWorldShim from "./GameWorldShim.svelte";
import ErrorScreen from "./ErrorScreen.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";
import { resetLoading, startPollingLoadingState } from "~/stores/loading";

import { identifyParticipant } from "./identifyParticipant"
import { initializeECS } from "./initializeECS"
import { locateSubrelm } from "./locateSubrelm"
import { getPermits } from "./getPermits"
import { getMetadata } from "./getMetadata"
import { connectYjs } from "./connectYjs"

import { WorldDoc } from "~/y-integration/WorldDoc";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { initializeWorldManager } from "./initializeWorldManager";

function init() {
  const initialState: RelmState = {
    playerId: null,
    secureParams: null,
    screen: "initial",
  };
  const initialCmd = identifyParticipant;
  return [initialState, initialCmd];
}

export const relmProgram = {
  init: init(),
  update(msg: RelmMessage, state: RelmState) {
    switch (msg.id) {
      case "error":
        return [{ ...state, screen: "error", errorMessage: msg.message }];

      case "identified":
        return [
          {
            ...state,
            playerId: msg.playerId,
            secureParams: msg.secureParams,
          },
          initializeECS,
        ];

      case "initializedECS":
        return [{ ...state, ecsWorld: msg.ecsWorld }, locateSubrelm];

      case "changeSubrelm":
        state.ecsWorld.reset();
        return [
          { ...state, subrelm: msg.subrelm, entryway: msg.entryway },
          Cmd.batch([getPermits(msg.subrelm), getMetadata(msg.subrelm)]),
        ];

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
        const ask = get(askMediaSetup);
        if (ask) {
          return [state, Cmd.ofMsg({ id: "prepareMedia" })];
        } else {
          return [state, Cmd.ofMsg({ id: "configuredMedia" })];
        }
      }

      case "prepareMedia":
        return [{ ...state, screen: "video-mirror" }];

      case "configuredMedia": {
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
    // console.log("view state change", state.screen);
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

const app = new SvelteProgram({
  target: document.body,
  props: { createApp: (props) => relmProgram },
});

export default app;
