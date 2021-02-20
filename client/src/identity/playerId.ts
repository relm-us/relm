import { uuidv4 } from "~/utils/uuid";
import { getOrCreateStoredItem } from "~/utils/getOrCreateStoredItem";

const SECURE_ID_KEY = "secureId";

export const playerId = getOrCreateStoredItem(SECURE_ID_KEY, () => uuidv4());
