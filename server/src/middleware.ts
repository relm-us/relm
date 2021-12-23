import { respond, joinError } from "./utils";
import { Player, Permission, Relm, useToken } from "./db";
import createError from "http-errors";

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

    try {
      req.verifiedPubKey = await Player.findOrCreateVerifiedPubKey({
        playerId,
        sig,
        x,
        y,
      });
      req.authenticatedPlayerId = playerId;
      next();
    } catch (err) {
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
