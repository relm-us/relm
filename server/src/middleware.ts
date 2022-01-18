import { respond, joinError, decodedValidJwt } from "./utils";
import { Player, Permission, Relm, useToken } from "./db";
import { JWTSECRET } from "./config";
import createError from "http-errors";
import { unabbreviatedPermissions } from "./utils/unabbreviatedPermissions";

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
    } else {
      respond(res, 400, {
        status: "error",
        reason: "relm name required",
      });
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
      respond(res, 404, {
        status: "error",
        reason: "relm does not exist",
      });
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
      const result = decodedValidJwt(req.headers["x-relm-jwt"], JWTSECRET);
      if (result) {
        req.jwtRaw = result;

        for (let relm in result.relms) {
          const permits = unabbreviatedPermissions(result.relms[relm]);
          await Permission.setPermissions({
            playerId: req.authenticatedPlayerId,
            relmId: req.relm.relmId,
            permits,
            // This ensures that a JWT token can also delete permits when needed:
            union: false
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

export function authorized(permission) {
  return async (req, _res, next) => {
    if (req.relm && req.relm.isPublic === true && permission === "access") {
      // Public relms don't need special permission to access
      next();
    } else {
      let permitted = false;
      try {
        const relmNames = req.relmName ? [req.relmName] : [];
        const permissions = await Permission.getPermissions({
          playerId: req.authenticatedPlayerId,
          relmNames,
        });

        if (req.relmName in permissions) {
          permitted = permissions[req.relmName].includes(permission);
        } else if ("*" in permissions) {
          permitted = permissions["*"].includes(permission);
        } else {
          permitted = false;
        }
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
