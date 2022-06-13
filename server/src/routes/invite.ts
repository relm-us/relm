import * as express from "express";
import cors from "cors";

import * as util from "../utils/index.js";
import * as middleware from "../middleware.js";
import { Invitation, Permission } from "../db/index.js";
import { respondWithSuccess } from "../utils/index.js";

const { wrapAsync } = util;

export const invite = express.Router();

// Create an invitation to a relm
invite.post(
  "/make",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("invite"),
  wrapAsync(async (req, res) => {
    const attrs: any = {
      relmId: req.relm.relmId,
      createdBy: req.authenticatedParticipantId,
      permits: ["access"],
    };

    if (req.body) {
      if ("token" in req.body) {
        attrs.token = req.body.token;
      }
      if ("maxUses" in req.body) {
        attrs.maxUses = req.body.maxUses;
      }
      if ("permits" in req.body) {
        attrs.permits = [...Permission.filteredPermits(req.body.permits)];
      }
    }

    let invitation;
    try {
      invitation = await Invitation.createInvitation(attrs);
    } catch (err) {
      if (err.message.match(/duplicate key/)) {
        invitation = await Invitation.updateInvitation(attrs);
      } else {
        throw err;
      }
    }

    respondWithSuccess(res, {
      action: "created",
      invitation: Invitation.toJSON(invitation),
    });
  })
);

// Get all invitations for this relm that match the query
invite.post(
  "/query",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("invite"),
  wrapAsync(async (req, res) => {
    const token = req.query["token"];
    const relmId = req.relm.relmId;

    const invitations = await Invitation.getInvitations({ relmId, token });

    respondWithSuccess(res, {
      action: "query",
      invitations: invitations.map((invite) => Invitation.toJSON(invite)),
    });
  })
);

invite.post(
  "/delete",
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized("invite"),
  wrapAsync(async (req, res) => {
    const attrs: any = {
      relmId: req.relm.relmId,
      token: req.body.token,
    };

    const invitations = await Invitation.deleteInvitation(attrs);

    respondWithSuccess(res, {
      action: "deleted",
      deletedCount: invitations.length,
    });
  })
);
