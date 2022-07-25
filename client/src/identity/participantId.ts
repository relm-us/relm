import { uuidv4 } from "~/utils/uuid";

const ID_KEY = "participantId";
const ID_KEY_DEPRECATED = "secureId";

function getParticipantId() {
  let id =
    localStorage.getItem(ID_KEY) ??
    localStorage.getItem(ID_KEY_DEPRECATED);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export let participantId: string = getParticipantId();

export const destroyParticipantId = () => {
  localStorage.removeItem(ID_KEY);
  localStorage.removeItem(ID_KEY_DEPRECATED);
  participantId = getParticipantId();
};