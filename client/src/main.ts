import { get } from "svelte/store";

import SvelteProgram from "~/main/SvelteProgram.svelte";
import * as Cmd from "./main/Cmd";
import { RelmState, RelmMessage } from "./main/RelmStateAndMessage";

import Blank from "./main/Blank.svelte";
import MediaSetupShim from "./main/MediaSetupShim.svelte";
import AvatarChooserShim from "./main/AvatarChooserShim.svelte";
import GameWorldShim from "./main/GameWorldShim.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";
import { resetLoading, startPollingLoadingState } from "~/stores/loading";

import { identifyParticipant } from "./main/identifyParticipant";
import { initializeECS } from "./main/initializeECS";
import { locateSubrelm } from "./main/locateSubrelm";
import { getPermits } from "./main/getPermits";
import { getMetadata } from "./main/getMetadata";
import { connectYjs } from "./main/connectYjs";

import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { askMediaSetup } from "~/stores/askMediaSetup";

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

      case "gotSubrelm":
        return [
          { ...state, subrelm: msg.subrelm, entryway: msg.entryway },
          Cmd.batch([getPermits(msg.subrelm), getMetadata(msg.subrelm)]),
        ];

      case "gotPermits":
        if (
          state.subrelm in msg.permits &&
          msg.permits[state.subrelm].length > 0
        ) {
          const permits = msg.permits[state.subrelm];
          return [
            { ...state, permits },
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
          state.worldDoc = new WorldDoc(state.ecsWorld);
          worldManager.init(
            state.ecsWorld,
            state.worldDoc,
            state.subrelm,
            state.entryway,
            state.subrelmDocId,
            state.twilioToken
          );
          console.log('combine state', state)
          return [
            { ...state },
            connectYjs(state.worldDoc, state.subrelmDocId, state.secureParams),
          ];
        } else {
          return [state]
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
    switch (state.screen) {
      case "initial":
        return [Blank];
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
