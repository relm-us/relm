import { db, sql } from "./db.js";
import { INSERT } from "./pgSqlHelpers.js";

import { nullOr } from "../utils/index.js";

type VariableColumns = {
  relm_id: string;
  variable_name: string;
  description: string;
  value: string; // JSONB
  created_by: string;
  created_at: Date;
  updated_at: Date;
};

const mkVariable = nullOr((cols: VariableColumns) => {
  return {
    relmId: cols.relm_id,
    name: cols.variable_name,
    description: cols.description,
    value: cols.value,
    createdBy: cols.created_by,
    createdAt: cols.created_at,
    updatedAt: cols.updated_at,
  };
});

export async function getVariable({
  relmId,
  name,
}: {
  relmId: string;
  name: string;
}) {
  return mkVariable(
    await db.oneOrNone(sql`
    SELECT *
      FROM variables
     WHERE relm_id = ${relmId}
       AND variable_name = ${name}
  `)
  );
}

export async function getVariables({ relmId }: { relmId: string }) {
  const rows = await db.manyOrNone(sql`
    SELECT *
      FROM variables
     WHERE relm_id = ${relmId}
  `);

  const vars = {};
  for (let row of rows) {
    vars[row.variable_name] = row.value;
  }

  return vars;
}

export async function setVariable({
  relmId,
  name,
  value,
  description = null,
}: {
  relmId: string;
  name: string;
  value: any;
  description?: string;
}) {
  const attrs: any = {
    relm_id: relmId,
    variable_name: name,
    value:
      value === null
        ? "null"
        : typeof value === "string"
        ? JSON.stringify(value)
        : value,
  };
  if (description !== null) {
    attrs.description = description;
  }
  let s = sql`
      ${INSERT("variables", attrs)}
      ON CONFLICT(relm_id, variable_name)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        value = ${attrs.value}
      RETURNING *
    `;
  // console.log("setVariable sql", s);
  return mkVariable(await db.one(s));
}
