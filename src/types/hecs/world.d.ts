export type World = {
  id: number;
  version: number;
  plugins: Map<Function, boolean>;
  entities: any;
  presentation: any;
  cssPresentation: any;
  providers: Object;
  update: (number) => void;
};
