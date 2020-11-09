export type World = {
  id: number;
  version: number;
  plugins: Map<Function, boolean>;
  entities: any;
  providers: Object;
};
