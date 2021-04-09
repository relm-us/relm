import { db, sql } from "./db";

/**
 * The `Player` model represents an authenticated player in the database. Note that
 * a User can have many Players: we don't require people to identify themselves
 * initially, so whatever their browser passes us as a playerId, we will use it as
 * long as it is signed (meaning we can guarantee uniqueness, as long as the browser
 * hasn't been compromised.)
 *
 * This implies that a person who has multiple browsers open will have multiple
 * players, if they haven't integrated their players into a single user identity.
 *
 */

import * as auth from "../auth";

export async function hasPubKeyDoc({ playerId }) {
  const pubKeyDoc = await getPubKeyDoc({ playerId });
  return pubKeyDoc !== null;
}

export async function getPubKeyDoc({ playerId }) {
  const row = await db.oneOrNone(sql`
      SELECT public_key_doc
      FROM players
      WHERE player_id = ${playerId}
    `);
  if (row !== null) {
    return row.public_key_doc;
  } else {
    return null;
  }
}

export async function addPubKeyDoc({ playerId, pubKeyDoc }) {
  await db.none(sql`
      INSERT INTO players (player_id, public_key_doc)
      VALUES (${playerId}, ${JSON.stringify(pubKeyDoc)})
    `);
}

export async function findOrCreateVerifiedPubKey({ playerId, x, y, sig }) {
  let pubKeyDocFromParams = false;

  // If user already has a registered public key doc, use it
  let pubKeyDoc = await getPubKeyDoc({ playerId });

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

  let signatureValid = await auth.verify(playerId, sig, pubKey);
  if (signatureValid) {
    if (pubKeyDocFromParams) {
      // Now that we've confirmed it is valid, store the new pubKeyDoc
      await addPubKeyDoc({ playerId, pubKeyDoc });
    }

    return pubKey;
  } else {
    throw Error(`invalid signature`);
  }
}
