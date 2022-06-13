import { uuidv4 } from "~/utils/uuid";

const ID_KEY = "participantId";

export const playerId = () => {
  let id =
    localStorage.getItem(ID_KEY) ??
    localStorage.getItem("secureId"); /* deprecated */
  if (!id) {
    id = uuidv4();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
};
