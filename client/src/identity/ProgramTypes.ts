import type { Vector3 } from "three";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import type {
  Participant,
  IdentityData,
  TransformData,
  UpdateData,
  Appearance,
} from "./types";
// import type { Identity } from "./Identity";
import type { WorldDoc } from "~/y-integration/WorldDoc";
import type { ParticipantYBroker } from "./ParticipantYBroker";

export type State = {
  participants: Map<string, Participant>;
  localParticipant?: Participant;

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
      appearance: Appearance;
      worldDoc: WorldDoc;
      ecsWorld: DecoratedECSWorld;
      entrywayPosition: Vector3;
    }
  | { id: "didSubscribeBroker"; broker: ParticipantYBroker; unsub: Function }
  | { id: "didMakeLocalParticipant"; localParticipant: Participant }
  | {
      id: "recvParticipantData";
      participantId: string;
      identityData: IdentityData;
      isLocal: boolean;
    }
  | {
      id: "sendParticipantData";
      participantId: string;
      updateData: UpdateData;
    }
  | {
      id: "removeParticipant";
      clientId: number;
    }
  | { id: "join" };

export type Dispatch = (message: Message) => void;
export type Effect = (dispatch: Dispatch) => void;
export type Program = {
  init: [State, Effect?];
  update: (this: void, msg: Message, state: State) => [State, Effect?];
  view: (this: void, state: State, dispatch: Dispatch) => void;
};
