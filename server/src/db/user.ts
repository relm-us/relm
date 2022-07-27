import { SavedIdentityData } from "relm-common";
import { compareEncryptedPassword, encrypt } from "../utils/encryption.js";
import { db, sql } from "./db.js";
import { nanoid } from "nanoid";

import { INSERT } from "./pgSqlHelpers.js";

type UserCreationData = {
  email : string,
  password? : string,
  emailVerificationRequired?: boolean
};

type UserCreationResult = {
  userId: string,
  emailCode?: string
};

export async function createUser({ email, password, emailVerificationRequired }: UserCreationData): Promise<UserCreationResult> {
  const userData: any = { email };
  if (password) {
    userData.password_hash = await encrypt(password);
  }

  const data = await db.one(sql`
      ${INSERT("users", userData)} RETURNING user_id
    `);

  const { user_id : userId } = data;

  if (emailVerificationRequired) {
    const emailCode = nanoid();

    await db.none(sql`INSERT INTO pending_email_verifications (user_id, code) VALUES (${userId}, ${emailCode}) ON CONFLICT DO NOTHING`);

    return {
      userId,
      emailCode
    };
  }

  return {
    userId
  };
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
  if (data === null || data.password_hash === null) {
    // user doesn't exist or no password is assigned with user.
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

export async function markAsCompletedEmailVerification({ userId }) {
  await db.none(sql`DELETE FROM pending_email_verifications WHERE user_id=${userId}`);
}