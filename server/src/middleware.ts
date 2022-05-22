import createError from "http-errors";

import {
  decodedValidJwt,
  hasPermission,
  joinError,
  respondWithError,
  unabbreviatedPermits,
} from "./utils/index.js";
import { Player, Permission, Relm, useToken } from "./db/index.js";
import { JWTSECRET } from "./config.js";

function getParam(req, key) {
  if (key in req.query) {
    return req.query[key];
  } else {
    return req.headers[`x-relm-${key}`];
  }
}

export function relmName(key = "relmName") {
  return (req, res, next) => {
    if (req.params[key]) {
      req.relmName = normalizeRelmName(req.params[key]);
      next();
    } else if (req.body[key]) {
      req.relmName = normalizeRelmName(req.body[key]);
      next();
    } else {
      respondWithError(res, "relm name required");
    }
  };
}

function normalizeRelmName(name) {
  return name.toLowerCase().replace(/[^a-z0-9\-]+/, "");
}

export function relmExists() {
  return async (req, res, next) => {
    req.relm = await Relm.getRelm({ relmName: req.relmName });
    if (!req.relm) {
      respondWithError(res, "relm does not exist");
    } else {
      next();
    }
  };
}

export function authenticated() {
  return async (req, _res, next) => {
    const playerId = getParam(req, "id");

    // the `id` (playerId), signed
    const sig = getParam(req, "s");

    const x = getParam(req, "x");
    const y = getParam(req, "y");

    const params = {
      playerId,
      sig,
      x,
      y,
    };

    try {
      req.verifiedPubKey = await Player.findOrCreateVerifiedPubKey(params);
      req.authenticatedPlayerId = playerId;
      next();
    } catch (err) {
      console.warn(`Can't findOrCreateVerifiedPubKey`, params);
      next(joinError(err, Error(`can't authenticate`)));
    }
  };
}

export function acceptToken() {
  return async (req, _res, next) => {
    const token = getParam(req, "t");
    const relmId = req.relm ? req.relm.relmId : undefined;
    const playerId = req.authenticatedPlayerId;

    try {
      await useToken({ token, relmId, playerId });
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
        JWTSECRET
      );
      if (result) {
        req.jwtRaw = result;
        for (let [relmName, abbrevPermits] of Object.entries(result.relms)) {
          const permits = unabbreviatedPermits(abbrevPermits);
          await Permission.setPermits({
            playerId: req.authenticatedPlayerId,
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

export function authorized(requestedPermission) {
  return async (req, _res, next) => {
    if (
      req.relm &&
      req.relm.isPublic === true &&
      requestedPermission === "access"
    ) {
      // Public relms don't need special permission to access
      next();
    } else {
      let permitted = false;
      try {
        const relmNames = req.relmName ? [req.relmName] : ["*"];
        const permissions = await Permission.getPermissions({
          playerId: req.authenticatedPlayerId,
          relmNames,
        });

        permitted = hasPermission(
          requestedPermission,
          permissions,
          req.relmName
        );
      } catch (err) {
        next(err);
      }

      if (permitted === true) {
        next();
      } else {
        next(createError(401, "unauthorized"));
      }
    }
  };
}
