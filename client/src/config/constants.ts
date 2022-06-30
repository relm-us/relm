export type ShadowMapType = "BASIC" | "PCF" | "VSM";
export const SHADOW_MAP_TYPE: ShadowMapType = "VSM";

export const DEFAULT_RELM_NAME = "default";
export const DEFAULT_ENTRYWAY = "default";
export const DEFAULT_DIRECTIONAL_LIGHT_POSITION = [-5, 5, 2.5];
export const DRAG_DISTANCE_THRESHOLD = 4;

export const LONG_PRESS_THRESHOLD = 350;

export const OCULUS_HEIGHT_STAND = 2.4;
export const OCULUS_HEIGHT_SIT = 1.5;

export const PROXIMITY_AUDIO_INNER_RADIUS = 3;
export const PROXIMITY_AUDIO_OUTER_RADIUS = 6;

// Physics time-step is independent of render framerate
export const PHYSICS_TIMESTEP = 1 / 60;

// When to slow down framerate after inactivity
export const FPS_SLOWDOWN_TIMEOUT = 5000;
export const FPS_SLOWDOWN_MIN_FPS = 20;

// How large (x, z) can an object be before it no longer makes sense
// to index it using an PointOctree:
export const SPATIAL_INDEX_THRESHOLD = 6;
export const SPATIAL_INDEX_WORLD_EXTENT = 250;

// 0 - 100, where 100 is completely zoomed out
export const DEFAULT_VIEWPORT_ZOOM = 25.0;

// Height of the avatar (GLB); TODO: make this a variable?
export const AVATAR_HEIGHT = 1.5;
// Due to the way GLB is exported, it is much larger in local
// transform, and we need to take that into account at times
export const AVATAR_HEIGHT_UNSCALED = 7;

// Distance from camera to object of focus (e.g. web page)
export const CAMERA_FOCUS_DISTANCE = 5.0;

// How quickly to move the camera as it follows the participant
export const CAMERA_LERP_ALPHA = 0.125;

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

// prettier-ignore
export const UNIQUE_COLOR_PALETTE = [
  "#000000","#434343","#999999","#cccccc","#efefef",
  "#ae081e","#ad4736","#c0775c","#ebc9b2","#521510",
  "#cd5432","#c45f2b","#eb8572","#f4b490","#9e440d",
  "#e58d27","#f0b526","#f2d631","#ece6ba","#c78b35",
  "#10866f","#6cb47c","#89cf82","#cef5e1","#225f34",
  "#086b75","#2188dd","#67b7d4","#81e2ea","#5d80b4",
  "#696daa","#906aa1","#d8bbcd","#c9ceec","#4f3b47",
];

// Feature Flag: enable or disable audio/video capabilities (e.g. Twilio)
export const AV_ENABLED: boolean = true;

// How often should identity data be saved after being updated?
export const IDENTITY_SAVE_INTERVAL = 2000;