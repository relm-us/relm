export type WorldDocStatus = "connecting" | "connected" | "disconnected";

export type WorldLayerLocal = { visible: boolean };
export type WorldLayerGlobal = { name: string };
export type WorldLayer = WorldLayerLocal & WorldLayerGlobal;
