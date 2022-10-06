import { db, sql } from "./db.js";

import { INSERT } from "./pgSqlHelpers.js";

type VisitColumns = {
  visit_id: string;
  relm_id: string;
  participant_id: string;
  created_at: Date;
};

type VisitCreationData = {
  relmId: string;
  participantId: string;
};

export async function createVisit({
  relmId,
  participantId,
}: VisitCreationData) {
  const visit: any = { relm_id: relmId, participant_id: participantId };

  const data = await db.one(sql`
      ${INSERT("visits", visit)} RETURNING visit_id
    `);

  return data.visit_id;
}
