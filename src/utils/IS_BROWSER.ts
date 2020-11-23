export const IS_BROWSER = typeof window !== "undefined";
export const IS_NODE_TEST = !IS_BROWSER && process.env.NODE_ENV !== "test";
