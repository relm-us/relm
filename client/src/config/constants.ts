export type ShadowMapType = "BASIC" | "PCF" | "VSM";
export const SHADOW_MAP_TYPE: ShadowMapType = "VSM";

export const DEFAULT_RELM_ID = "default";
export const DEFAULT_ENTRYWAY = "default";
export const DEFAULT_DIRECTIONAL_LIGHT_POSITION = [-5, 5, 2.5];
export const DRAG_DISTANCE_THRESHOLD = 4;

export const OCULUS_HEIGHT_STAND = 2.4;
export const OCULUS_HEIGHT_SIT = 1.5;

// 0 - 100, where 100 is completely zoomed out
export const DEFAULT_VIEWPORT_ZOOM = 25.0;

// Height of the avatar (GLB); TODO: make this a variable?
export const AVATAR_HEIGHT = 1.5;

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
