import { get } from "svelte/store";
import { Vector3 } from "three";

import { worldManager } from "~/world";

import { Cmd } from "~/utils/runtime";
import { exists } from "~/utils/exists";

import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";

import { loadPreferredDeviceIds } from "~/av/loadPreferredDeviceIds";

import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";
import { resetLoading, startPollingLoadingState } from "~/stores/loading";

import GameWorld from "./views/GameWorld.svelte";
import ErrorScreen from "./views/ErrorScreen.svelte";
import BlankWithLogo from "./views/BlankWithLogo.svelte";
import MediaSetupShim from "./views/MediaSetupShim.svelte";

import { createECSWorld } from "./effects/createECSWorld";
import { getPositionFromEntryway } from "./effects/getPositionFromEntryway";
import { initWorldManager } from "./effects/initWorldManager";
import { getParticipantAndRelm } from "./effects/getParticipantAndRelmName";
import { getRelmPermitsAndMetadata } from "./effects/getRelmPermitsAndMetadata";
import { importPhysicsEngine } from "./effects/importPhysicsEngine";
import { nextSetupStep } from "./effects/nextSetupStep";
import { createWorldDoc } from "./effects/createWorldDoc";

import { makeProgram as makeParticipantProgram } from "~/identity/Program";
import { State as RelmState, Message as RelmMessage } from "./ProgramTypes";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("program");

/**
 * The main Relm program
 */
export function makeProgram() {
  const participantProgram = makeParticipantProgram();
  return {
    init: [
      { screen: "initial", participantState: participantProgram.init[0] },
      Cmd.ofMsg({ id: "pageLoaded" }),
    ],
    update(msg: RelmMessage, state: RelmState): [RelmState, any?] {
      if (logEnabled) {
        console.log(`program msg '${msg.id}' (${state.relmName}): %o`, {
          msg,
          state,
        });
      }

      // Handle composed ParticipantProgram's updates
      if (msg.id === "participantMessage") {
        const [participantState, participantEffect] = participantProgram.update(
          msg.message,
          state.participantState
        );

        let newEffect = Cmd.mapEffect(participantEffect, (message) => ({
          id: "participantMessage",
          message,
        }));
        // console.log("got ParticipantMessage", msg.message);

        // Once we have a local participant initialized, we can initialize the
        // WorldManager, which depends on knowing where the avatar is in the world
        if (msg.message.id === "didMakeLocalParticipant") {
          return [
            { ...state, participantState },
            Cmd.batch([newEffect, Cmd.ofMsg({ id: "initWorldManager" })]),
          ];
        } else {
          return [{ ...state, participantState }, newEffect];
        }
      }

      // Handle top-level relm Program's updates
      switch (msg.id) {
        case "pageLoaded": {
          return [state, getParticipantAndRelm];
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
              relmName: msg.relmName,
              entryway: msg.entryway,
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
          exists(state.relmName, "relmName");
          exists(state.entryway, "entryway");

          return [state, getRelmPermitsAndMetadata(state.relmName)];
        }

        case "gotSecureParamsAndRelm": {
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
          exists(msg.permits, "permits");
          exists(msg.relmDocId, "relmDocId");
          exists(msg.entitiesMax, "entitiesMax");
          exists(msg.assetsMax, "assetsMax");
          exists(msg.twilioToken, "twilioToken");

          if (!msg.permits.includes("access")) {
            return [
              state,
              Cmd.ofMsg({ id: "error", message: `Permission not granted` }),
            ];
          }

          // Set the "max values" for the loading progress bar
          resetLoading(msg.assetsMax, msg.entitiesMax);

          console.log(
            `relm entities: ${msg.entitiesMax}, assets: ${msg.assetsMax}`
          );

          return [
            {
              ...state,
              permits: msg.permits,
              relmDocId: msg.relmDocId,
              entitiesMax: msg.entitiesMax,
              assetsMax: msg.assetsMax,
              twilioToken: msg.twilioToken,
            },
            // Kick off parallel loading physics->ECS->worldDoc;
            // meanwhile, set up audio/video and avatar if needed
            Cmd.batch([importPhysicsEngine, nextSetupStep(state)]),
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
          exists(state.secureParams, "secureParams");
          exists(msg.ecsWorld, "ecsWorld");
          exists(msg.ecsWorldLoaderUnsub, "ecsWorldLoaderUnsub");

          return [
            {
              ...state,
              ecsWorld: msg.ecsWorld,
              ecsWorldLoaderUnsub: msg.ecsWorldLoaderUnsub,
            },
            createWorldDoc(msg.ecsWorld, state.relmDocId, state.secureParams),
          ];
        }

        case "createdWorldDoc": {
          exists(state.ecsWorld, "ecsWorld");
          exists(msg.worldDoc, "worldDoc");

          return [
            { ...state, worldDoc: msg.worldDoc },
            Cmd.ofMsg({ id: "loading" }),
          ];
        }

        case "setUpAudioVideo": {
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

        case "didSetUpAudioVideo": {
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

        case "setUpAvatar": {
          return [{ ...state, screen: "choose-avatar" }];
        }

        case "didSetUpAvatar":
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
            Cmd.batch([
              getPositionFromEntryway(state.worldDoc, state.entryway),
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
            Cmd.ofMsg({ id: "gotEntrywayPosition" }),
          ];
        }

        case "assumeOriginAsEntryway": {
          if (!state.entrywayPosition) {
            alert("This relm's default entryway is not yet set.");
            return [
              { ...state, entrywayPosition: new Vector3(0, 0, 0) },
              Cmd.ofMsg({ id: "gotEntrywayPosition" }),
            ];
          } else {
            return [state];
          }
        }

        case "gotEntrywayPosition": {
          return [
            state,
            Cmd.ofMsg({
              id: "participantMessage",
              message: {
                id: "init",
                appearance: state.appearance,
                worldDoc: state.worldDoc,
                ecsWorld: state.ecsWorld,
                entrywayPosition: state.entrywayPosition,
              },
            }),
          ];
        }

        case "initWorldManager": {
          if (
            // Command sent from gotEntrywayPosition
            state.entrywayPosition &&
            // .. and also sent from our intercepted `didMakeLocalParticipant` updater
            state.participantState.localParticipant
          ) {
            // Stop making the world "tick" just for loading
            state.ecsWorldLoaderUnsub?.();

            return [
              state,
              initWorldManager(
                state.participantState.broker,
                state.ecsWorld,
                state.worldDoc,
                state.relmName,
                state.entryway,
                state.relmDocId,
                state.twilioToken,
                state.participantState.participants
              ),
            ];
          } else {
            return [state];
          }
        }

        case "didInitWorldManager": {
          return [
            { ...state, initializedWorldManager: true },
            Cmd.ofMsg({ id: "loadedAndReady" }),
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
              Cmd.ofMsg({ id: "startPlaying" }),
            ];
          } else {
            return [state];
          }
        }

        case "startPlaying":
          return [
            { ...state, overlayScreen: null, screen: "game-world" },
            Cmd.ofMsg({ id: "participantMessage", message: { id: "join" } }),
          ];

        // We store entrywayUnsub for later when we may need it for a portal
        case "gotEntrywayUnsub": {
          return [{ ...state, entrywayUnsub: msg.entrywayUnsub }];
        }

        // Error page to show what went wrong
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
}

export const Program = makeProgram();
