import { WorldDoc } from "~/y-integration/WorldDoc";
import type { SecureParams } from "~/identity/secureParams";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { DeviceIds } from "video-mirror";

export type RelmState = {
  // initialization
  participantId?: string;
  secureParams?: SecureParams;
  relmName?: string; // unique human name for the relm
  entryway?: string;

  // relm metadata
  relmDocId?: string; // server-assigned UUID for the relm
  permits?: string[];
  assetsMax?: number;
  assetsCount?: number;
  entitiesMax?: number;
  entitiesCount?: number;
  twilioToken?: string;

  // audio/video setup
  audioVideoSetupDone?: boolean;
  audioDesired?: boolean;
  videoDesired?: boolean;
  preferredDeviceIds?: DeviceIds;

  // avatar setup
  avatarSetupDone?: boolean;

  // create worldDoc & establish yjs connection
  physicsEngine?: any;
  ecsWorld?: DecoratedECSWorld;
  worldDoc?: WorldDoc;

  // other
  changingSubrelm?: boolean;
  errorMessage?: string;
  screen?:
    | "error"
    | "initial"
    | "video-mirror"
    | "choose-avatar"
    | "loading-screen"
    | "loading-failed"
    | "game-world";
};

export type RelmMessage =
  | { id: "pageLoaded" }
  | {
      id: "gotParticipantAndRelm";
      participantId: string;
      secureParams: SecureParams;
      relmName: string;
      entryway: string;
    }
  | {
      id: "gotRelmPermitsAndMetadata";
      permits: string[];
      relmDocId: string;
      entitiesCount: number;
      assetsCount: number;
      twilioToken: string;
    }
  | { id: "importedPhysicsEngine"; physicsEngine: any }
  | { id: "createdWorldDoc"; ecsWorld: DecoratedECSWorld; worldDoc: WorldDoc }
  | { id: "configureAudioVideo" }
  | { id: "configuredAudioVideo"; state: any }
  | { id: "chooseAvatar" }
  | { id: "choseAvatar" }
  | { id: "loadedAndReady" }
  | { id: "startPlaying" }
  | { id: "error"; message: string; stack?: any };

export type Dispatch = (message: RelmMessage) => void;
