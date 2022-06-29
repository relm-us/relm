import { Appearance, getDefaultAppearance } from "relm-common";
import { compareEncryptedPassword, encrypt } from "../utils/encryption.js";
import { db, sql } from "./db.js";

import { INSERT } from "./pgSqlHelpers.js";

type UserCreationData = {
  email : string,
  password : string,
  appearance? : Appearance
};

export async function createUser({ email, password, appearance } : UserCreationData) {
  const hashedPassword = await encrypt(password);

  const userData = {
    email,
    password_hash: hashedPassword,
    appearance: JSON.stringify(appearance || getDefaultAppearance("male"))
  };

  const data = await db.one(sql`
      ${INSERT("users", userData)} RETURNING user_id
    `);
  return data.user_id;
}

export async function deleteUserByEmail({ email }) {
  await db.none(sql`
      DELETE FROM users WHERE LOWER(email)=LOWER(${email})
    `);
}

export async function getUserIdByEmail({ email } : { email : string }) {
  const row = await db.oneOrNone(sql`
    SELECT user_id FROM users WHERE LOWER(email)=LOWER(${email})
  `);

  if (!row) {
    return null;
  }
  return row.user_id;
}

export async function verifyCredentials({ email, password }) {
  const data = await db.oneOrNone(sql`
      SELECT password_hash FROM users WHERE LOWER(email)=LOWER(${email})
    `);

  if (data === null) {
    return false;
  }

  const { password_hash : passwordHash } = data;
  const isCorrectPassword = await compareEncryptedPassword(password, passwordHash);

  return isCorrectPassword;
}

export async function setAppearanceData({ userId, appearance } : { userId : any, appearance : Appearance }) {
  await db.none(sql`
    UPDATE users WHERE user_id=${userId} SET appearance=${appearance}
  `);
}

export async function getAppearanceData({ userId }): Promise<Appearance> {
  const data = await db.oneOrNone(sql`
      SELECT appearance FROM users WHERE user_id=${userId}
    `);

  if (data === null) {
    return null;
  }

  return Object.assign(getDefaultAppearance("male"), data.appearance);
}