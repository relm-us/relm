export type World = {
  id: number;
  version: number;
  plugins: Map<Function, boolean>;
  entities: any;
  presentation: any;
  cssPresentation: any;
  components: any;
  providers: Object;
  update: (number) => void;
  reset: Function;
};
