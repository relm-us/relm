import { SavedIdentityData } from "relm-common";
import { compareEncryptedPassword, encrypt } from "../utils/encryption.js";
import { db, sql } from "./db.js";

import { INSERT } from "./pgSqlHelpers.js";

type UserCreationData = {
  email : string,
  password : string
};

function isValidEmail(email: string) {
  const emailAtSplitIndex = email.lastIndexOf("@");
  
  // Split it into userPart @ domainPart.com
  const userPart = email.substring(0, emailAtSplitIndex);
  const domainPart = email.substring(emailAtSplitIndex + 1);

  const userPartIsValid = userPart.length > 0;
  const domainPartIsValid = domainPart.includes(".") && domainPart.length >= 3;

  return userPartIsValid && domainPartIsValid;
}

export async function createUser({ email, password }: UserCreationData) {
  const hashedPassword = await encrypt(password);

  if (!isValidEmail(email)) {
      throw Error("Invalid email provided");
  }

  const userData = {
    email,
    password_hash: hashedPassword
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

export async function setIdentityData({ userId, identity } : { userId : any, identity : SavedIdentityData }) {
  await db.none(sql`
    UPDATE users SET identity_data=${identity} WHERE user_id=${userId}
  `);
}

export async function getIdentityData({ userId }): Promise<SavedIdentityData> {
  const data = await db.oneOrNone(sql`
      SELECT identity_data FROM users WHERE user_id=${userId}
    `);

  if (data === null) {
    return null;
  }

  return data.identity_data;
}