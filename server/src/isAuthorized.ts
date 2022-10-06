import { hasPermission } from "./utils/hasPermission.js";
import { Participant, Permission, Doc } from "./db/index.js";
import { RelmDocWithName, type RelmDoc } from "./db/doc.js";

type Signature = {
  participantId: string;
  sig: string;
  x: string;
  y: string;
};

type Error = {
  kind: "error";
  msg: string;
  log: string;
};

type Unauthorized = {
  kind: "unauthorized";
  msg: string;
  log: string;
};

type Authorized = {
  kind: "authorized";
  doc: RelmDoc;
  permissions: any;
};

export type AuthResult = Authorized | Unauthorized | Error;

export async function isAuthorized(
  docId: string,
  signature: Signature
): Promise<AuthResult> {
  let verifiedPubKey;
  try {
    verifiedPubKey = await Participant.findOrCreateVerifiedPubKey(signature);
  } catch (err) {
    return {
      kind: "error",
      msg: "unable to verify public key",
      log: `Can't verify public key for participant '${signature.participantId}'`,
    };
  }

  // Check that we are authenticated first
  if (!verifiedPubKey) {
    return {
      kind: "unauthorized",
      msg: "public key is not valid",
      log: `Invalid public key from participant '${signature.participantId}'`,
    };
  }

  // Get relm from docId
  const doc: RelmDocWithName = await Doc.getDocWithRelmName({ docId });

  if (!doc) {
    return {
      kind: "error",
      msg: "relm not found",
      log: `Relm with docId not found '${docId}'`,
    };
  }

  const permissions = await Permission.getPermissions({
    participantId: signature.participantId,
    relmIds: [doc.relmId],
  });

  // Do we have permission to access this relm?
  const permitted = hasPermission("access", permissions, doc.relmId);

  if (permitted) {
    return {
      kind: "authorized",
      doc,
      permissions,
    };
  } else {
    return {
      kind: "unauthorized",
      msg: "unauthorized",
      log: `Participant '${signature.participantId}' sought to enter docId '${docId}' but was unauthorized`,
    };
  }
}
