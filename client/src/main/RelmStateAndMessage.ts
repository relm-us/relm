import { WorldDoc } from "~/y-integration/WorldDoc";
import type { SecureParams } from "~/identity/secureParams";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { DeviceIds } from "video-mirror";

export type RelmState = {
  playerId?: string;
  secureParams?: SecureParams;
  audioDesired?: boolean;
  videoDesired?: boolean;
  preferredDeviceIds?: DeviceIds;
  physicsEngine?: any;
  ecsWorld?: DecoratedECSWorld;
  worldDoc?: WorldDoc;
  twilioToken?: string;
  subrelm?: string;
  changingSubrelm?: boolean;
  entryway?: string;
  permits?: string[];
  subrelmDocId?: string;
  entitiesMax?: number;
  entitiesCount?: number;
  assetsMax?: number;
  assetsCount?: number;
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
  | {
      id: "identified";
      playerId: string;
      secureParams: SecureParams;
    }
  | { id: "importedPhysicsEngine"; physicsEngine: any }
  | { id: "initializedECS"; ecsWorld: DecoratedECSWorld }
  | { id: "changeSubrelm"; subrelm: string; entryway: string }
  | { id: "gotSubrelm"; subrelm: string; entryway: string }
  | { id: "gotPermits"; permits: string }
  | {
      id: "gotMetadata";
      subrelmDocId: string;
      twilioToken: string;
      entitiesCount: number;
      assetsCount: number;
    }
  | { id: "combinePermitsAndMetadata" }
  | { id: "connectedYjs" }
  | { id: "configureAudioVideo"; respectSkip?: boolean }
  | { id: "configuredAudioVideo"; state: any }
  | { id: "chooseAvatar" }
  | { id: "choseAvatar" }
  | { id: "startPlaying" }
  | { id: "error"; message: string; stack?: any };

export type Dispatch = (message: RelmMessage) => void;
