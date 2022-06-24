import { compareEncryptedPassword, encrypt } from "../utils/encryption.js";
import { db, sql } from "./db.js";

import { INSERT } from "./pgSqlHelpers.js";

type UserCreationData = {
  email : string,
  password : string,
  appearance? : object
};

export async function createUser({ email, password, appearance } : UserCreationData) {
  const hashedPassword = await encrypt(password);

  const userData = {
    email,
    password_hash: hashedPassword,
    appearance: appearance ? JSON.stringify(appearance) : null
  };

  await db.none(sql`
      ${INSERT("users", userData)}
    `);
}

export async function deleteUserByEmail({ email }) {
  await db.none(sql`
      DELETE FROM users WHERE email=${email}
    `);
}

export async function getUserIdByEmail({ email } : { email : string }) {
  const row = await db.oneOrNone(sql`
    SELECT user_id FROM users WHERE email=${email}
  `);

  if (!row) {
    return null;
  }
  return row.user_id;
}

export async function verifyCredentials({ email, password }) {
  const data = await db.oneOrNone(sql`
      SELECT password_hash FROM users WHERE email=${email}
    `);

  if (data === null) {
    return false;
  }

  const { password_hash : passwordHash } = data;
  const isCorrectPassword = await compareEncryptedPassword(password, passwordHash);

  return isCorrectPassword;
}

export async function getAppearanceData({ userId }) {
  const data = await db.oneOrNone(sql`
      SELECT appearance FROM users WHERE user_id=${userId}
    `);

  if (data === null) {
    return null;
  }

  return data.appearance;
}