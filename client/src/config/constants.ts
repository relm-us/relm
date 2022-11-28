export type ShadowMapType = "BASIC" | "PCF" | "VSM";
export const SHADOW_MAP_TYPE: ShadowMapType = "VSM";

export const DEFAULT_RELM_NAME = "default";
export const DEFAULT_ENTRYWAY = "default";
export const DEFAULT_DIRECTIONAL_LIGHT_POSITION = [-5, 5, 2.5];
export const DRAG_DISTANCE_THRESHOLD = 4;

export const OCULUS_HEIGHT_STAND = 2.4;
export const OCULUS_HEIGHT_SIT_CHAIR = 1.9;
export const OCULUS_HEIGHT_SIT_GROUND = 1.5;

export const COLLIDER_HEIGHT_STAND = 1.8;
export const COLLIDER_HEIGHT_SIT_CHAIR = 1.0;

export const TEXTURE_PER_WORLD_UNIT = 100;

export const PROXIMITY_AUDIO_INNER_RADIUS = 3;
export const PROXIMITY_AUDIO_OUTER_RADIUS = 6;

// Physics time-step is independent of render framerate
export const PHYSICS_TIMESTEP = 1 / 60;

// How large (x, z) can an object be before it no longer makes sense
// to index it using an PointOctree:
export const SPATIAL_INDEX_THRESHOLD = 6;
export const SPATIAL_INDEX_WORLD_EXTENT = 250;

// Height of the avatar (GLB); TODO: make this a variable?
export const AVATAR_HEIGHT = 1.5;
// Due to the way GLB is exported, it is much larger in local
// transform, and we need to take that into account at times
export const AVATAR_HEIGHT_UNSCALED = 7;
// Scale the avatar body down due to the way it is stored in GLB format
export const AVATAR_BODY_SCALE = 0.25;

// Time to revert to centered head after no mouse/pointer movement (millis)
export const AVATAR_RECENTER_HEAD_NO_POINTER_MOTION = 3000;

// Only allow mouse/tap on things near the avatar; heuristic for avoiding activating
// things far away and behind floors or walls
export const AVATAR_POINTER_TAP_MAX_DISTANCE = 15;

// How many seconds can elapse before a full location reset; otherwise, refresh to last known coords
export const RESTORE_LAST_LOCATION_REFRESH_SECONDS = 120;

// How quickly to move the camera as it follows the participant
export const CAMERA_PLAY_DAMPENING = 0.3;
export const CAMERA_BUILD_DAMPENING = 0.15;

// How quickly to rotate the camera in build mode (higher is slower / more accurate)
export const CAMERA_ROTATE_RATE = 100;

export const CAMERA_PLAY_ZOOM_MIN = 5;
export const CAMERA_PLAY_ZOOM_MAX = 25;
export const CAMERA_BUILD_ZOOM_MIN = 5;
export const CAMERA_BUILD_ZOOM_MAX = 50;
export const CAMERA_FRUSTUM_FAR_PLANE = 100;

// Angle (in radians) from which the camera looks down
export const DEFAULT_CAMERA_ANGLE = (52.5 / 180) * Math.PI;

// 0 to 1.0, where 1 is completely zoomed out
export const DEFAULT_VIEWPORT_ZOOM = 0.35;

// Milliseconds for UI cross-fade transitions
export const CROSS_FADE_DURATION = 200;

// Milliseconds to wait for transition between load screen and game screen
export const INITIAL_LOAD_GAME_WAIT = 250;

// Always have a "base" layer available, where entities go if no layer is explicitly selected
export const BASE_LAYER_ID = "BASE_LAYER";

// Animation names from participant model GLB
export const T_POSE = "a-pose";
export const FLYING = "flying";
export const IDLE = "idle-standing";
export const JUMPING = "jumping";
export const LOWERING_HAND = "lowering-hand";
export const RAISING_HAND = "raising-hand-pose";
export const RUNNING = "running";
export const SCREEN_SHARING = "screen-sharing";
export const WALKING = "walking";
export const WAVING = "waving";
export const STAND_SIT = "stand-to-sit-ground";
export const CHAIR_SIT = "stand-to-sit-chair";
export const FALLING = "a-pose";

// prettier-ignore
export const UNIQUE_COLOR_PALETTE = [
  "#000000","#434343","#999999","#cccccc","#efefef",
  "#521510","#ae081e","#ad4736","#c0775c","#ebc9b2",
  "#9e440d","#cd5432","#c45f2b","#eb8572","#f4b490",
  "#c78b35","#e58d27","#f0b526","#f2d631","#ece6ba",
  "#225f34","#10866f","#6cb47c","#89cf82","#cef5e1",
  "#086b75","#5d80b4","#2188dd","#67b7d4","#81e2ea",
  "#4f3b47","#696daa","#906aa1","#d8bbcd","#c9ceec",
];

// Feature Flag: enable or disable audio/video capabilities (e.g. Twilio)
export const AV_ENABLED: boolean = true;

// How often should identity data be saved after being updated?
export const IDENTITY_SAVE_INTERVAL = 2000;

// How long should toast notifications be displayed (ms)
export const DEFAULT_NOTIFICATION_WAIT = 6500;

// The image to use as the background of the 2d "Dashboard"
export const DASHBOARD_BACKGROUND_URL =
  "https://assets.ourrelm.com/da15c70953c21875c81b584e21b88935-346972.webp";
