import { roomConnectState } from "../../stores/roomConnectState";

const initialState = {
  url: null,
  state: "new", // new/connecting/connected/disconnected/closed,
  activeSpeakerId: null,
  statsPeerId: null,
  faceDetection: false,
};

const room = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ROOM_URL": {
      const { url } = action.payload;

      const newState = { ...state, url };

      return newState;
    }

    case "SET_ROOM_STATE": {
      const roomState = action.payload.state;

      const newState =
        roomState === "connected"
          ? { ...state, state: roomState }
          : {
              ...state,
              state: roomState,
              activeSpeakerId: null,
              statsPeerId: null,
            };
      roomConnectState.set(roomState);

      return newState;
    }

    case "SET_ROOM_ACTIVE_SPEAKER": {
      const { peerId } = action.payload;

      const newState = { ...state, activeSpeakerId: peerId };

      return newState;
    }

    case "SET_ROOM_STATS_PEER_ID": {
      const { peerId } = action.payload;

      const newState =
        state.statsPeerId === peerId
          ? { ...state, statsPeerId: null }
          : { ...state, statsPeerId: peerId };

      return newState;
    }

    case "SET_FACE_DETECTION": {
      const flag = action.payload;

      const newState = { ...state, faceDetection: flag };

      return newState;
    }

    case "REMOVE_PEER": {
      const { peerId } = action.payload;
      const newState = { ...state };

      if (peerId && peerId === state.activeSpeakerId)
        newState.activeSpeakerId = null;

      if (peerId && peerId === state.statsPeerId) newState.statsPeerId = null;

      return newState;
    }

    default:
      return state;
  }
};

export default room;
