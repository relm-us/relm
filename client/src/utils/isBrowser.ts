export const isBrowser = new Function("try {return this===window;}catch(e){ return false;}")

export const isNode = () => !isBrowser()

export const isNodeEnv = (env: string) =>
  // @ts-ignore
  isNode() && process.env.NODE_ENV === env
