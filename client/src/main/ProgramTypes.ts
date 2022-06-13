import type { Vector3 } from "three";
import type { DeviceIds } from "video-mirror";
import type { Writable } from "svelte/store";

import type { AuthenticationHeaders } from "relm-common";

import type { WorldDoc } from "~/y-integration/WorldDoc";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { AVConnection } from "~/av/AVConnection";

import type {
  IdentityData,
  UpdateData,
  PageParams,
  WorldDocStatus,
} from "~/types";
import type { ParticipantYBroker } from "~/identity/ParticipantYBroker";
import type { Avatar } from "~/identity/Avatar";
import type { Appearance, Participant } from "~/types/identity";

export type State = {
  // initialization
  globalBroadcast: BroadcastChannel;
  pageParams?: PageParams;
  authHeaders?: AuthenticationHeaders;
  entrywayPosition?: Vector3;
  entrywayUnsub?: Function;

  // relm metadata
  relmDocId?: string; // server-assigned UUID for the relm
  permits?: string[];
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
  broker?: ParticipantYBroker;
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
  | {
      id: "gotRelmPermitsAndMetadata";
      permits: string[];
      relmDocId: string;
      entitiesMax: number;
      assetsMax: number;
      overrideParticipantName: string;
      twilioToken: string;
    }

  // Participants
  | { id: "didSubscribeBroker"; broker: ParticipantYBroker }
  | { id: "didMakeLocalAvatar"; avatar: Avatar }
  | {
      id: "recvParticipantData";
      participantId: string;
      identityData: IdentityData;
    }
  | {
      id: "updateLocalIdentityData";
      identityData: UpdateData;
    }
  | {
      id: "removeParticipant";
      clientId: number;
    }
  | { id: "participantJoined"; participant: Participant }
  | { id: "join" }

  // cont'd...
  | { id: "importedPhysicsEngine"; physicsEngine: any }
  | { id: "createdWorldDoc"; worldDoc: WorldDoc }
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
