import { SavedIdentityData } from "relm-common";
import { compareEncryptedPassword, encrypt } from "../utils/encryption.js";
import { db, sql } from "./db.js";
import { nanoid } from "nanoid";

import { INSERT } from "./pgSqlHelpers.js";

type UserCreationData = {
  email : string,
  password? : string,
  emailVerificationRequired?: boolean
} | {
  jwtId : string
};

type UserCreationResult = {
  userId: string,
  emailCode?: string
};

export async function createUser(data: UserCreationData): Promise<UserCreationResult> {
  const isJWT = "jwtId" in data;

  const userData: any = {
    loginId: isJWT ? data.jwtId : data.email
  };
  if (!isJWT && data.password) {
    userData["password_hash"] = await encrypt(data.password);
  }

  const insertData = await db.one(sql`
      ${INSERT("users", userData)} RETURNING user_id
    `);

  const { user_id : userId } = insertData;

  if (!isJWT && data.emailVerificationRequired) {
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

export async function deleteUserByLoginId(data : { email: string } | { jwtId: string }) {
  const userId = await this.getUserIdByLoginId(data);
  
  await db.none(sql`DELETE FROM pending_email_verifications WHERE user_id=${userId}`);
  await db.none(sql`DELETE FROM users WHERE user_id=${userId}`);
}

export async function getUserIdByLoginId(data : { email: string } | { jwtId: string }) {
  const isJWT = "jwtId" in data;
  const loginId = isJWT ? data.jwtId : data.email;

  const row = await db.oneOrNone(sql`
    SELECT user_id FROM users WHERE LOWER(login_id)=LOWER(${loginId}) AND is_jwt=${isJWT} 
  `);

  if (!row) {
    return null;
  }
  return row.user_id;
}

export async function verifyEmailPassword({ email, password }) {
  const data = await db.oneOrNone(sql`
      SELECT password_hash FROM users WHERE LOWER(login_id)=LOWER(${email}) AND is_jwt=false
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

// Returns whether or not the user's email was marked as complete ONLY IF a pending verification is available.
export async function markAsCompletedEmailVerification({ code }) {
  const { length: rows } = await db.query(sql`DELETE FROM pending_email_verifications WHERE code=${code} RETURNING *`);
  return rows > 0;
}