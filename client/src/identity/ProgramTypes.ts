import type { Vector3 } from "three";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type { Participant, IdentityData, Appearance } from "./types";
import type { WorldDoc } from "~/y-integration/WorldDoc";
import type { ParticipantYBroker } from "./ParticipantYBroker";
import { Avatar } from "./Avatar";

export type State = {
  participants: Map<string, Participant>;
  localAvatarInitialized: boolean;

  worldDoc?: WorldDoc;
  ecsWorld?: DecoratedECSWorld;
  broker?: ParticipantYBroker;

  unsubs: Function[];
  observeFieldsFn?: any;
  observeChatFn?: any;

  // activeCache: Identity[];
};

export type Message =
  | {
      id: "init";
      worldDoc: WorldDoc;
      ecsWorld: DecoratedECSWorld;
      entrywayPosition: Vector3;
    }
  | { id: "didSubscribeBroker"; broker: ParticipantYBroker; unsub: Function }
  | { id: "makeLocalAvatar"; entrywayPosition: Vector3 }
  | { id: "didMakeLocalAvatar"; avatar: Avatar }
  | {
      id: "recvParticipantData";
      participantId: string;
      identityData: IdentityData;
      isLocal: boolean;
    }
  | {
      id: "sendLocalParticipantData";
      identityData: IdentityData;
    }
  | {
      id: "removeParticipant";
      clientId: number;
    }
  | { id: "participantJoined"; participant: Participant }
  | { id: "join" };

export type Dispatch = (message: Message) => void;
export type Effect = (dispatch: Dispatch) => void;
export type Program = {
  init: [State, Effect?];
  update: (this: void, msg: Message, state: State) => [State, Effect?];
  view: (this: void, state: State, dispatch: Dispatch) => void;
};
