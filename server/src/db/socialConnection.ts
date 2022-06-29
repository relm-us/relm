import { db, sql, INSERT } from "./db.js";

// Register a user to a social platform using their platform profileId
export async function registerSocial({ social, profileId, userId } : { social : string, userId : string, profileId : any }) {
  await db.none(sql`
      ${INSERT("login_social_connections", {
        user_id: userId,
        connection_type: social,
        profile_id: profileId
      })}
    `);
}

// Check if a user is connected already via a social.
export async function isUserConnectedViaSocial({ social, userId } : { social : string, userId : string }) {
  const isConnected = (await db.one(sql`
    SELECT COUNT(*) AS rows FROM login_social_connections WHERE connection_type=${social} AND user_id=${userId}
   `)).rows > 0;

   return isConnected;
}

// Get a user from their social platform and platform profileId
export async function getUserIdBySocial({ social, profileId } : { social : string, profileId : string }) {
  const data = await db.oneOrNone(sql`
      SELECT user_id FROM login_social_connections WHERE connection_type=${social} AND profile_id=${profileId}
    `);
  
  if (data !== null) {
    return data.user_id;
  } else {
    return null;
  }
}