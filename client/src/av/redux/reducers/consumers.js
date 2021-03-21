import { consumers as consumersStore } from "../../stores/consumers";

const initialState = {};

const consumers = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ROOM_STATE": {
      const roomState = action.payload.state;

      const newState = roomState === "closed" ? {} : state;
      consumersStore.set(newState);

      return newState;
    }

    case "ADD_CONSUMER": {
      const { consumer } = action.payload;

      const newState = { ...state, [consumer.id]: consumer };
      consumersStore.set(newState);

      return newState;
    }

    case "REMOVE_CONSUMER": {
      const { consumerId } = action.payload;
      const newState = { ...state };

      delete newState[consumerId];
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_PAUSED": {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];
      let newConsumer;

      if (originator === "local")
        newConsumer = { ...consumer, locallyPaused: true };
      else newConsumer = { ...consumer, remotelyPaused: true };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_RESUMED": {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];
      let newConsumer;

      if (originator === "local")
        newConsumer = { ...consumer, locallyPaused: false };
      else newConsumer = { ...consumer, remotelyPaused: false };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_CURRENT_LAYERS": {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = {
        ...consumer,
        currentSpatialLayer: spatialLayer,
        currentTemporalLayer: temporalLayer,
      };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_PREFERRED_LAYERS": {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = {
        ...consumer,
        preferredSpatialLayer: spatialLayer,
        preferredTemporalLayer: temporalLayer,
      };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_PRIORITY": {
      const { consumerId, priority } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = { ...consumer, priority };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_TRACK": {
      const { consumerId, track } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = { ...consumer, track };

      const newState = { ...state, [consumerId]: newConsumer };
      consumersStore.set(newState);

      return newState;
    }

    case "SET_CONSUMER_SCORE": {
      const { consumerId, score } = action.payload;
      const consumer = state[consumerId];

      if (!consumer) return state;

      const newConsumer = { ...consumer, score };

      const newState = { ...state, [consumerId]: newConsumer };
      // TODO: Do we care about score?
      // consumersStore.set(newState);

      return newState;
    }

    default: {
      // skip e.g. SET_ROOM_ACTIVE_SPEAKER
      // consumersStore.set(state);
      return state;
    }
  }
};

export default consumers;
