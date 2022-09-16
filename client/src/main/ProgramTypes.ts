import type { Vector3 } from "three";
import type { DeviceIds } from "video-mirror";
import type { Writable } from "svelte/store";
import type { Appearance, Awareness, SavedIdentityData } from "relm-common";

import type { AuthenticationHeaders, Security } from "relm-common";

import type { WorldDoc } from "~/y-integration/WorldDoc";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { AVConnection } from "~/av/AVConnection";

import type { UpdateData, PageParams, WorldDocStatus } from "~/types";
import type { ParticipantBroker } from "~/identity/ParticipantBroker";
import type { Avatar } from "~/identity/Avatar";
import type { IdentityData, Participant } from "~/types/identity";

export type State = {
  // initialization
  globalBroadcast: BroadcastChannel;
  pageParams?: PageParams;
  authHeaders?: AuthenticationHeaders;
  entrywayPosition?: Vector3;
  entrywayUnsub?: Function;
  savedIdentity?: SavedIdentityData;
  security?: Security;

  // relm metadata
  permanentDocId?: string; // server-assigned UUID for the relm ydoc
  transientDocId?: string; // server-assigned UUID for the transient awareness ydoc
  assetsMax?: number;
  assetsCount?: number;
  entitiesMax?: number;
  entitiesCount?: number;
  twilioToken?: string;

  // participants
  participants: Map<string, Participant>;
  overrideParticipantName?: string; // override used by JWT
  participantQuickAppearance?: Appearance;
  localAvatarInitialized: boolean;
  localIdentityData: Writable<IdentityData>;
  broker?: ParticipantBroker;
  observeFieldsFn?: any;
  observeChatFn?: any;

  // audio/video setup
  audioVideoSetupDone?: boolean;
  initialAudioDesired?: boolean;
  initialVideoDesired?: boolean;
  preferredDeviceIds: Writable<DeviceIds>;
  avConnection?: AVConnection;
  avDisconnect?: Function;

  // avatar setup
  avatarSetupDone?: boolean;

  // create worldDoc & establish yjs connection
  physicsEngine?: any;
  ecsWorld?: DecoratedECSWorld;
  ecsWorldLoaderUnsub?: Function;
  worldDoc?: WorldDoc;
  worldDocStatus: WorldDocStatus;
  initializedWorldManager?: boolean;

  // other
  notifyContext?: any;
  doneLoading?: boolean;
  errorMessage?: string;
  overlayScreen?: "portal";
  screen:
    | "error"
    | "initial"
    | "video-mirror"
    | "choose-avatar"
    | "loading-screen"
    | "loading-failed"
    | "game-world";
};

export type Message =
  | { id: "gotPageParams"; pageParams: PageParams }
  | { id: "gotAuthenticationHeaders"; authHeaders: AuthenticationHeaders }
  | { id: "enterPortal"; relmName: string; entryway: string }
  | { id: "didEnterPortal" }
  | { id: "didResetWorld" }
  | { id: "gotIdentityData"; identity: SavedIdentityData; isConnected: boolean }
  | {
      id: "gotRelmPermitsAndMetadata";
      permits: string[];
      permanentDocId: string;
      transientDocId: string;
      entitiesMax: number;
      assetsMax: number;
      overrideParticipantName: string;
      twilioToken: string;
    }

  // Participants
  | { id: "didMakeLocalAvatar"; avatar: Avatar }
  | {
      id: "updateLocalIdentityData";
      identityData: UpdateData;
    }
  | { id: "participantJoined"; participant: Participant }
  | { id: "participantLeft"; participantId: string }
  | { id: "join" }

  // cont'd...
  | { id: "importedPhysicsEngine"; physicsEngine: any }
  | {
      id: "createdWorldDoc";
      worldDoc: WorldDoc;
      slowAwareness: Awareness;
      rapidAwareness: Awareness;
    }
  | {
      id: "createdECSWorld";
      ecsWorld: DecoratedECSWorld;
      ecsWorldLoaderUnsub: Function;
    }
  | { id: "gotWorldDocStatus"; status: WorldDocStatus }
  | { id: "gotEntrywayUnsub"; entrywayUnsub: Function }
  | { id: "gotPositionFromEntryway"; entrywayPosition: Vector3 }
  | { id: "assumeOriginAsEntryway" }
  | { id: "gotEntrywayPosition" }
  | { id: "didMakeLocalParticipant"; localParticipant: Participant }
  | { id: "setUpAudioVideo" }
  | {
      id: "didSetUpAudioVideo";
      audioDesired?: boolean;
      videoDesired?: boolean;
      preferredDeviceIds?: DeviceIds;
    }
  | { id: "didJoinAudioVideo"; avDisconnect: Function }
  | { id: "setUpAvatar" }
  | { id: "didSetUpAvatar"; appearance?: Appearance }
  | { id: "gotIdentityData"; identity: SavedIdentityData; isConnected: boolean }
  | { id: "prepareLocalParticipantForWorld" }
  | { id: "initWorldManager" }
  | { id: "didInitWorldManager" }
  | { id: "loadStart" }
  | { id: "loadPoll" }
  | { id: "loadComplete" }
  | { id: "gotLoadingState"; assetsCount: number; entitiesCount: number }
  | { id: "loadedAndReady" }
  | { id: "startPlaying" }
  | { id: "notify"; notification: any }
  | { id: "recomputeWorldDocStats" }
  | { id: "gotNotificationContext"; notifyContext: any }
  | { id: "error"; message: string; stack?: any };

export type Dispatch = (message: Message) => void;
export type Effect = (dispatch: Dispatch) => void | Promise<void>;

export type Init = [State, Effect?];
export type Update = (
  this: void,
  msg: Message,
  state: State
) => [State, Effect?];
export type View = (this: void, state: State, dispatch: Dispatch) => void;

export type Program = {
  init: Init;
  update: Update;
  view: View;
};
