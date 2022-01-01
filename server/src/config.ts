import dotenv from "dotenv";

dotenv.config();

const SECURITY_CONFIG = {
  name: "ECDSA",
  namedCurve: "P-384",
  namedHash: "SHA-384",
};

const MAX_TOKEN_LENGTH = 100;
const MAX_UUID_LENGTH = 36;
const MAX_FILE_SIZE = 2097152 * 8;
const MAX_FILE_EXTENSION_LENGTH = 30; // e.g. '.jpeg', '.gltf', '.packed-gltf'
const SETUP_TOKEN = "setup";
const SETUP_TOKEN_COUNTER = 1;
const CONTENT_TYPE_JSON = { "Content-Type": "application/json" };
const ASSETS_DIR = process.env.ASSETS_DIR;
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || ASSETS_DIR;
const TMP_DIR = process.env.TMP_DIR || ASSETS_DIR;
const PASSWORD_LENGTH_MINIMUM = 6;
const PORT = process.env.PORT || 3000;
const YGARBAGE_COLLECTION = process.env.GC !== "0";
const YPERSISTENCE = process.env.YPERSISTENCE;

const DATABASE_URL = process.env.DATABASE_URL;
// --- OR ---
const DATABASE_NAME = process.env.DATABASE_NAME || "relm";
const DATABASE_HOST = process.env.DATABASE_HOST || "/var/run/postgresql";
// NOTE: Password should not be set if using postgres peer authentication
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET;

const SPACES_KEY = process.env.SPACES_KEY;
const SPACES_SECRET = process.env.SPACES_SECRET;
const SPACES_BUCKET = process.env.SPACES_BUCKET;
const SPACES_ENDPOINT =
  process.env.SPACES_ENDPOINT || "sfo3.digitaloceanspaces.com";

const JWTSECRET = process.env.JWTSECRET;

const DEFAULT_RELM_CONTENT = {
  entities: [
    {
      id: "kXVJ1et70sE_5t6gy7JZh",
      name: "Ground",
      parent: null,
      children: [],
      meta: {},
      Transform: {
        position: [0, -0.7, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
      Shape: {
        kind: "CYLINDER",
        cylinderRadius: 15,
        cylinderHeight: 1,
        cylinderSegments: 60,
        color: "#55814e",
        emissive: "#000000",
        roughness: 0.8,
        metalness: 0.2,
        texture: { name: "", filename: "", url: "" },
        textureScale: 1,
      },
      RigidBody: {
        kind: "STATIC",
      },
      Collider: {
        shape: "CYLINDER",
        cylinderRadius: 15,
        cylinderHeight: 1,
        offset: [0, 0, 0],
        density: 1,
        interaction: 131079,
      },
    },
    {
      id: "P0QenCqE9wqjhhKEhKi-E",
      name: "Skybox",
      parent: null,
      children: [],
      meta: {},
      Skybox: {
        image: {
          name: "",
          filename: "",
          url:
            "https://assets.ourrelm.com/edc3d0040ef1e1feece33adef09b32c4-7496.webp",
        },
      },
    },
  ],
  entryways: {
    default: [0, 0, 0],
  },
  settings: {},
};

export {
  SECURITY_CONFIG,
  MAX_TOKEN_LENGTH,
  MAX_UUID_LENGTH,
  MAX_FILE_SIZE,
  MAX_FILE_EXTENSION_LENGTH,
  SETUP_TOKEN,
  SETUP_TOKEN_COUNTER,
  CONTENT_TYPE_JSON,
  ASSETS_DIR,
  SCREENSHOTS_DIR,
  TMP_DIR,
  PASSWORD_LENGTH_MINIMUM,
  PORT,
  YGARBAGE_COLLECTION,
  YPERSISTENCE,
  DATABASE_URL,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_PASSWORD,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  SPACES_KEY,
  SPACES_SECRET,
  SPACES_BUCKET,
  SPACES_ENDPOINT,
  JWTSECRET,
  DEFAULT_RELM_CONTENT,
};
