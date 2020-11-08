export type World = {
  id: number;
  version: number;
  plugins: Map<Function, boolean>;
  providers: Object;
};
