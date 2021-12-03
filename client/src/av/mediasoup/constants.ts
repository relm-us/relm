export const VIDEO_CONSTRAINTS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }],
};

// Used for simulcast webcam video.
export const WEBCAM_SIMULCAST_ENCODINGS = [
  { scaleResolutionDownBy: 4, maxBitrate: 500000 },
  { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
  { scaleResolutionDownBy: 1, maxBitrate: 5000000 },
];

// Used for VP9 webcam video.
export const WEBCAM_KSVC_ENCODINGS = [{ scalabilityMode: "S3T3_KEY" }];

// Used for simulcast screen sharing.
export const SCREEN_SHARING_SIMULCAST_ENCODINGS = [
  { dtx: true, maxBitrate: 1500000 },
  { dtx: true, maxBitrate: 6000000 },
];

// Used for VP9 screen sharing.
export const SCREEN_SHARING_SVC_ENCODINGS = [
  { scalabilityMode: "S3T3", dtx: true },
];
