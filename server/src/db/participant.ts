import { db, sql } from "./db.js";

/**
 * The `Participant` model represents an authenticated participants in the database. Note
 * that a User can have many Participants: we don't require people to identify themselves
 * initially, so whatever their browser passes us as a participantId, we will use it as
 * long as it is signed (meaning we can guarantee uniqueness, as long as the browser
 * hasn't been compromised.)
 *
 * This implies that a person who has multiple browsers open will have multiple
 * participants, if they haven't integrated their participants into a single user identity.
 *
 */

import * as auth from "../auth.js";

export async function hasPubKeyDoc({ participantId }) {
  const pubKeyDoc = await getPubKeyDoc({ participantId });
  return pubKeyDoc !== null;
}

export async function getPubKeyDoc({ participantId }) {
  const row = await db.oneOrNone(sql`
      SELECT public_key_doc
      FROM participants
      WHERE participant_id = ${participantId}
    `);
  if (row !== null) {
    return row.public_key_doc;
  } else {
    return null;
  }
}

export async function addPubKeyDoc({ participantId, pubKeyDoc }) {
  await db.none(sql`
      INSERT INTO participants (participant_id, public_key_doc)
      VALUES (${participantId}, ${JSON.stringify(pubKeyDoc)})
    `);
}

export async function findOrCreateVerifiedPubKey({ participantId, x, y, sig }) {
  let pubKeyDocFromParams = false;

  // If user already has a registered public key doc, use it
  let pubKeyDoc = await getPubKeyDoc({ participantId });

  if (pubKeyDoc === null) {
    // If not, then accept the xydoc from params (if available) and generate a public key document
    if (x && y) {
      pubKeyDoc = await auth.xyDocToPubKeyDoc({ x, y });
      pubKeyDocFromParams = true;
    } else {
      console.error(`public key err`, x, y);
      throw Error(
        `public key neither found in database nor provided as parameter`
      );
    }
  }

  // Verify the signature (using the pubKeyDoc)
  const pubKey = await auth.pubKeyDocToPubKey(pubKeyDoc);

  let signatureValid = await auth.verify(participantId, sig, pubKey);
  if (signatureValid) {
    if (pubKeyDocFromParams) {
      // Now that we've confirmed it is valid, store the new pubKeyDoc
      await addPubKeyDoc({ participantId, pubKeyDoc });
    }

    return pubKey;
  } else {
    throw Error(`invalid signature`);
  }
}
