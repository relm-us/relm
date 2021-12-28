import { Permission } from "./permission";

import { db, sql, INSERT, UPDATE } from "./db";
import { uuidv4 } from "../utils";

function randomToken() {
  return uuidv4().split("-")[0];
}

type InvitationColumns = {
  token: string;
  relm_id: string;
  relm_name: string;
  permits: Array<Permission>;
  used: number;
  max_uses: number;
  created_at: Date;
  created_by: string;
};

function mkInvitation(cols: InvitationColumns) {
  return {
    token: cols.token,
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    permits: new Set(cols.permits),
    used: cols.used,
    maxUses: cols.max_uses,
    createdAt: cols.created_at,
    createdBy: cols.created_by,
  };
}

const database = db;

export function toJSON(invitation) {
  return Object.assign({}, invitation, { permits: [...invitation.permits] });
}

export async function createInvitation(
  {
    token = randomToken(),
    relmId,
    maxUses = 1,
    permits = ["access"],
    createdBy = null,
  }: {
    token: string;
    relmId?: string;
    maxUses?: number;
    permits?: Array<Permission>;
    createdBy?: string;
  },
  db = database
) {
  const attrs = {
    token: token,
    relm_id: relmId,
    max_uses: maxUses,
    permits: JSON.stringify(permits),
    created_by: createdBy,
  };
  return mkInvitation(
    await db.one(sql`
        ${INSERT("invitations", attrs)}
        RETURNING *
      `)
  );
}

export async function getInvitation(
  { token, relmId }: { token: string; relmId?: string },
  db = database
) {
  const row = await db.oneOrNone(sql`
      SELECT i.*, r.relm_name
      FROM invitations i
      LEFT JOIN relms r USING (relm_id)
      WHERE token = ${token}
    `);

  if (row === null) {
    return null;
  } else {
    if (relmId) {
      const invitationRelmId = row.relm_id;
      if (invitationRelmId === relmId || invitationRelmId === null) {
        return mkInvitation(row);
      } else {
        throw Error(
          `token not valid for relm '${row.relm_name}' ('${invitationRelmId}')`
        );
      }
    } else {
      return mkInvitation(row);
    }
  }
}

export async function useInvitation(
  {
    token,
    relmId,
    playerId,
  }: { token: string; relmId?: string; playerId?: string },
  db = database
) {
  const row = await db.oneOrNone(
    sql`
      SELECT i.*
      FROM invitation_uses iu
      LEFT JOIN invitations i USING (token, relm_id)
      WHERE iu.token = ${token}
        AND iu.relm_id = ${relmId}
        AND iu.used_by = ${playerId}
    `
  );
  if (row !== null) {
    // Valid token already used, return without errors
    return row;
  }

  return await db.task("useInvitation", async (task) => {
    const invite = await getInvitation({ token, relmId }, task as any);

    if (invite) {
      if (invite.used < invite.maxUses) {
        await db.tx((t) => {
          const queries = [];

          queries.push(
            t.none(sql`
              ${UPDATE("invitations", { used: invite.used + 1 })}
              WHERE token = ${token}
            `)
          );

          if (playerId) {
            const attrs = {
              token,
              used_by: playerId,
              relm_id: relmId,
            };
            queries.push(
              t.none(sql`
                ${INSERT("invitation_uses", attrs)}
              `)
            );
          }

          return t.batch(queries);
        });

        return Object.assign(invite, { used: invite.used + 1 });
      } else {
        throw Error("invitation no longer valid");
      }
    } else {
      throw Error("invitation not found");
    }
  });
}
