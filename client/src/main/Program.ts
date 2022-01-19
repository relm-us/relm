import { get } from "svelte/store";
import { Vector3 } from "three";

import { worldManager } from "~/world";

import { Cmd } from "~/utils/runtime";
import { exists } from "~/utils/exists";

import AvatarChooser from "~/ui/AvatarBuilder/AvatarChooser.svelte";
import { LoadingScreen, LoadingFailed } from "~/ui/LoadingScreen";

import { loadPreferredDeviceIds } from "~/av/loadPreferredDeviceIds";
import { AVConnection } from "~/av/AVConnection";

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
import { getRelmPermitsAndMetadata } from "./effects/getRelmPermitsAndMetadata";
import { importPhysicsEngine } from "./effects/importPhysicsEngine";
import { nextSetupStep } from "./effects/nextSetupStep";
import { createWorldDoc } from "./effects/createWorldDoc";

import { makeProgram as makeParticipantProgram } from "~/identity/Program";
import { State, Message } from "./ProgramTypes";
import { joinAudioVideo } from "./effects/joinAudioVideo";
import { mapParticipantEffect } from "./mapParticipantEffect";
import { playerId } from "~/identity/playerId";
import { updateLocalParticipant } from "./effects/updateLocalParticipant";
import { getPageParams } from "./effects/getPageParams";
import { getAuthenticationHeaders } from "./effects/getAuthenticationHeaders";

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
      {
        screen: "initial",
        participantId: playerId,
        participantState: participantProgram.init[0],
      },
      getPageParams,
    ],
    update(msg: Message, state: State): [State, any?] {
      if (logEnabled) {
        console.log(
          `program msg '${msg.id}' (${state.pageParams.relmName}): %o`,
          {
            msg,
            state,
          }
        );
      }

      // Handle composed ParticipantProgram's updates
      if (msg.id === "participantMessage") {
        const [participantState, participantEffect] = participantProgram.update(
          msg.message,
          state.participantState
        );

        // Map the Participant Program's effect into an effect for our "main" Program
        let mainEffect = mapParticipantEffect(participantEffect);

        // Once we have a local participant initialized, we can initialize the
        // WorldManager, which depends on knowing where the avatar is in the world
        if (msg.message.id === "didMakeLocalAvatar") {
          return [
            { ...state, participantState },
            Cmd.batch([mainEffect, Cmd.ofMsg({ id: "initWorldManager" })]),
          ];
        } else {
          return [{ ...state, participantState }, mainEffect];
        }
      }

      // Handle top-level relm Program's updates
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

          // Set the "max values" for the loading progress bar
          resetLoading(msg.assetsMax, msg.entitiesMax);

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
            { ...state, worldDoc: msg.worldDoc },
            Cmd.batch([
              Cmd.ofMsg({ id: "loading" }),

              // Initialize the Participant Program
              Cmd.ofMsg({
                id: "participantMessage",
                message: {
                  id: "init",
                  worldDoc: msg.worldDoc,
                  ecsWorld: state.ecsWorld,
                },
              }),
            ]),
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

          const effects = [
            joinAudioVideo(
              newState.participantState.participants.get(playerId),
              newState.avConnection,
              newState.avDisconnect,
              newState.audioDesired,
              newState.videoDesired,
              newState.relmDocId,
              newState.twilioToken
            ) as Function,
          ];

          if (newState.initializedWorldManager) {
            effects.push(Cmd.ofMsg({ id: "startPlaying" }));
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
          const localParticipant =
            state.participantState.participants.get(playerId);

          const newState: State = {
            ...state,
            avatarSetupDone: true,
          };

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
              getPositionFromEntryway(
                state.worldDoc,
                state.pageParams.entryway
              ),
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
            Cmd.ofMsg<Message>({
              id: "participantMessage",
              message: {
                id: "makeLocalAvatar",
                entrywayPosition: state.entrywayPosition,
              },
            }),
          ];
        }

        case "initWorldManager": {
          if (
            // Command sent from gotEntrywayPosition
            state.entrywayPosition &&
            // .. and also sent from our intercepted `didMakeLocalAvatar` updater
            state.participantState.localAvatarInitialized
          ) {
            // Stop making the world "tick" just for loading
            state.ecsWorldLoaderUnsub?.();

            exists(state.avConnection, "avConnection");

            return [
              state,
              initWorldManager(
                state.participantState.broker,
                state.ecsWorld,
                state.worldDoc,
                state.pageParams,
                state.relmDocId,
                state.avConnection,
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
