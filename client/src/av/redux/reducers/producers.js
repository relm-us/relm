import { producers as producersStore } from "../../stores/producers";

const initialState = {};

const producers = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ROOM_STATE": {
      const roomState = action.payload.state;

      if (roomState === "closed") return {};
      else return state;
    }

    case "ADD_PRODUCER": {
      const { producer } = action.payload;

      const newState = { ...state, [producer.id]: producer };
      producersStore.set(newState);

      return newState;
    }

    case "REMOVE_PRODUCER": {
      const { producerId } = action.payload;
      const newState = { ...state };

      delete newState[producerId];
      producersStore.set(newState);

      return newState;
    }

    case "SET_PRODUCER_PAUSED": {
      const { producerId } = action.payload;
      const producer = state[producerId];
      const newProducer = { ...producer, paused: true };

      const newState = { ...state, [producerId]: newProducer };
      producersStore.set(newState);

      return newState;
    }

    case "SET_PRODUCER_RESUMED": {
      const { producerId } = action.payload;
      const producer = state[producerId];
      const newProducer = { ...producer, paused: false };

      const newState = { ...state, [producerId]: newProducer };
      producersStore.set(newState);

      return newState;
    }

    case "SET_PRODUCER_TRACK": {
      const { producerId, track } = action.payload;
      const producer = state[producerId];
      const newProducer = { ...producer, track };

      const newState = { ...state, [producerId]: newProducer };
      producersStore.set(newState);

      return newState;
    }

    case "SET_PRODUCER_SCORE": {
      const { producerId, score } = action.payload;
      const producer = state[producerId];

      if (!producer) return state;

      const newProducer = { ...producer, score };

      return { ...state, [producerId]: newProducer };
    }

    default: {
      return state;
    }
  }
};

export default producers;
