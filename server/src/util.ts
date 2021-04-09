import * as bcrypt from "bcrypt";
import * as config from "./config";

/**
 * Generates a random UUID (version 4). This can be used as a decentralized way
 * to create an identifier that has such a low probability of collision that it
 * can essentially be treated as universally unique.
 *
 * @returns {string}
 */
export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const UUID_RE = /^([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}){1}$/;

/**
 * A simple way to mark some function parameters as required
 *
 * @param {string} missing - the name of the potentially missing parameter
 */
export function required(missing) {
  throw new Error("Missing " + missing);
}
// Shortcut to Required('parameterName'), e.g. req`parameterName`
export const req = required;

export function fail(res, reason) {
  console.error(reason);
  res.writeHead(500, config.CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify({
      status: "error",
      reason: reason,
    })
  );
}

export function respond(res, code, json) {
  res.writeHead(code, config.CONTENT_TYPE_JSON);
  res.end(
    JSON.stringify(
      Object.assign(
        {
          status: code === 200 ? "success" : "failure",
        },
        json
      )
    )
  );
}

export function normalizeRelmName(name) {
  return name.toLowerCase().replace(/[^a-z0-9\-]+/, "");
}

export function joinError(error, newError) {
  newError.stack += `\nCaused By:\n` + error.stack;
  return newError;
}

// We use wrapAsync so that async errors get caught and handled by our generic error handler
export function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Used for logging IP addresses
export function getRemoteIP(req) {
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress;
}

export async function encrypt(password) {
  return new Promise((resolve, reject) => {
    if (typeof password === "string") {
      if (password.length >= config.PASSWORD_LENGTH_MINIMUM) {
        bcrypt.hash(password, 10, function (err, hash) {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      } else {
        reject(
          Error(
            `password length must be greater than ${config.PASSWORD_LENGTH_MINIMUM}`
          )
        );
      }
    } else {
      resolve(null);
    }
  });
}

export async function compareEncryptedPassword(password, encryptedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, encryptedPassword, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function getDefinedKeys(object) {
  return Object.keys(object)
    .filter((k) => object[k] !== undefined)
    .sort();
}

export function getUrlParams(requestUrl) {
  const queryString = requestUrl.slice(requestUrl.indexOf("?"));
  return new URLSearchParams(queryString);
}

/**
 * If the first param to fn is null or undefined, skip calling the function and just
 * return null or undefined. Otherwise, call the function.
 *
 * @param {Function} fn
 */
export function nullOr(fn) {
  return (arg) => {
    if (arg === null || arg === undefined) {
      return arg;
    } else {
      return fn(arg);
    }
  };
}
