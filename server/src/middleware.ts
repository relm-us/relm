import createError from "http-errors";

import {
  decodedValidJwt,
  hasPermission,
  joinError,
  respondWithError,
  unabbreviatedPermits,
} from "./utils/index.js";
import { type AuthenticationHeaders, canonicalIdentifier } from "relm-common";
import { Participant, Permission, Relm, useToken } from "./db/index.js";
import { createDefaultRelm } from "./createDefaultRelm.js";
import { JWTSECRET, DEFAULT_RELM_CONTENT } from "./config.js";

export function relmName(key = "relmName") {
  return (req, res, next) => {
    if (req.params[key]) {
      req.relmName = normalizeRelmName(req.params[key]);
      next();
    } else if (req.body[key]) {
      req.relmName = normalizeRelmName(req.body[key]);
      next();
    } else {
      const participantId = getParam(req, "x-relm-participant-id");
      respondWithError(res, "relm name required", {
        participantId,
        ...req.body,
      });
    }
  };
}

export function relmExists() {
  return async (req, res, next) => {
    req.relm = await Relm.getRelm({ relmName: req.relmName });
    if (!req.relm) {
      const participantId = getParam(req, "x-relm-participant-id");
      if (process.env.RELM_UNSAFE_AUTOINIT == "true" && req.relmName === "default") {
        await createDefaultRelm(participantId, DEFAULT_RELM_CONTENT);
        next();
      } else {
        respondWithError(res, "relm does not exist", {
          participantId,
          relmName: req.relmName,
        });
      }
    } else {
      next();
    }
  };
}

export function authenticated() {
  return async (req, _res, next) => {
    if (req.session.participantId) {
      req.verifiedPubKey = await Participant.getPubKeyDoc({
        participantId: req.session.participantId,
      });
      req.authenticatedParticipantId = req.session.participantId;
      next();
      return;
    }

    const participantId = getParam(req, "x-relm-participant-id");
    if (!participantId) {
      const reason = "can't authenticate without participantId";
      next(Error(reason));
    }

    // the `id` (participantId), signed
    const sig = getParam(req, "x-relm-participant-sig");

    const x = getParam(req, "x-relm-pubkey-x");
    const y = getParam(req, "x-relm-pubkey-y");

    const params = {
      participantId,
      sig,
      x,
      y,
    };

    try {
      req.verifiedPubKey = await Participant.findOrCreateVerifiedPubKey(params);
      req.authenticatedParticipantId = participantId;
      next();
    } catch (err) {
      console.warn(`Can't findOrCreateVerifiedPubKey`, params);
      next(joinError(err, Error(`can't authenticate`)));
    }
  };
}

export function authenticatedForOAuth() {
  return async (req, _res, next) => {
    const participantId = req.session.participantId;

    if (!participantId) {
      return next(createError(401, "Not authenticated"));
    }
    next();
  };
}

export function authenticatedWithUser() {
  return async (req, _res, next) => {
    const participantId = req.authenticatedParticipantId;

    const userId = await Participant.getUserId({ participantId });

    if (userId !== null) {
      req.authenticatedUserId = userId;
      next();
    } else {
      next(createError(401, "Not authenticated"));
    }
  };
}

export function acceptToken() {
  return async (req, _res, next) => {
    const token = getParam(req, "x-relm-invite-token");
    const relmId = req.relm ? req.relm.relmId : undefined;
    const participantId = req.authenticatedParticipantId;

    try {
      await useToken({ token, relmId, participantId });
      next();
    } catch (err) {
      if (err.message.match(/no longer valid/)) {
        next();
      } else {
        next(err);
      }
    }
  };
}

export function acceptJwt() {
  return async (req, _res, next) => {
    if (JWTSECRET && req.headers["x-relm-jwt"]) {
      const result: { relms: Record<string, string> } = decodedValidJwt(
        req.headers["x-relm-jwt"],
        JWTSECRET,
      );
      if (result) {
        req.jwtRaw = result;
        for (const [relmName, abbrevPermits] of Object.entries(result.relms)) {
          const permits = unabbreviatedPermits(abbrevPermits);
          await Permission.setPermits({
            participantId: req.authenticatedParticipantId,
            relmName,
            permits,
            // This ensures that a JWT token can also delete permits when needed:
            union: false,
          });
        }

        // Success
        next();
      } else {
        next(createError(401, "JWT unauthorized"));
      }
    } else {
      // Not configured for JWT; OK
      next();
    }
  };
}

export function authorized(
  requestedPermission: Permission.Permission | ((req: any) => Permission.Permission),
) {
  return async (req, _res, next) => {
    // Handle potential callback that gives us the Permission string
    if (typeof requestedPermission === "function") {
      requestedPermission = requestedPermission(req);
    }

    // Not permitted by default
    let permitted = false;

    if (req.relm && req.relm.publicPermits[requestedPermission] === true) {
      // Public relms grant permissions unto themselves, regardless of authenticated participant
      permitted = true;
    } else if (requestedPermission) {
      try {
        const relmNames = req.relmName ? [req.relmName] : ["*"];
        const permissions = await Permission.getPermissions({
          participantId: req.authenticatedParticipantId,
          relmNames,
        });

        permitted = hasPermission(requestedPermission, permissions, req.relmName);
      } catch (err) {
        next(err);
      }
    }

    if (permitted === true) {
      next();
    } else {
      next(createError(401, "unauthorized"));
    }
  };
}

function getParam(req, key: keyof AuthenticationHeaders) {
  if (key in req.query) {
    //   return req.query[key.replace("x-relm-", "")];
    // } else if ("state" in req.query) {
    //   // Case scenario of OAuth as we cannot pass headers into it
    //   try {
    //     const payload = JSON.parse(
    //       Buffer.from(req.query.state, "base64").toString()
    //     );
    //     return payload[key];
    //   } catch (error) {
    //     return null;
    //   }
    return req.query[key];
  }

  return req.headers[key];
}

function normalizeRelmName(name) {
  if (!name || name.length > 512) return "";

  return name
    .split("/")
    .map((part) => canonicalIdentifier(part))
    .join("/");
}
