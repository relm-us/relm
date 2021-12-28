import { WorldDoc } from "~/y-integration/WorldDoc";
import type { SecureParams } from "~/identity/secureParams";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

export type RelmState = {
  playerId?: string;
  secureParams?: SecureParams;
  ecsWorld?: DecoratedECSWorld;
  worldDoc?: WorldDoc;
  twilioToken?: string;
  subrelm?: string;
  entryway?: string;
  permits?: string[];
  subrelmDocId?: string;
  entitiesMax?: number;
  entitiesCount?: number;
  assetsMax?: number;
  assetsCount?: number;
  screen?:
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
  | { id: "initializedECS"; ecsWorld: DecoratedECSWorld }
  | { id: "gotSubrelm"; subrelm: string; entryway: string }
  | { id: "gotPermits"; permits: Record<string, string[]> }
  | {
      id: "gotMetadata";
      subrelmDocId: string;
      twilioToken: string;
      entitiesCount: number;
      assetsCount: number;
    }
  | { id: "combinePermitsAndMetadata" }
  | { id: "connectedYjs" }
  | { id: "prepareMedia" }
  | { id: "configuredMedia" }
  | { id: "choseAvatar" }
  | { id: "startPlaying" }
  | { id: "error"; message: string; stack?: any };

export type Dispatch = (message: RelmMessage) => void;
