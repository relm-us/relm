import { TypeOfSystem } from "./System";
import { TypeOfComponent } from "./Component";
import { World } from "./World";

export type DecorateFn = (world: World) => void;

export type PluginOptions = {
  name?: string;
  plugins?: Array<Pluginable>;
  systems?: Array<TypeOfSystem>;
  components?: Array<TypeOfComponent>;
  decorate?: DecorateFn;
};

export type Plugin = {
  name: string;
  plugins: Array<Pluginable>;
  systems: Array<TypeOfSystem>;
  components: Array<TypeOfComponent>;
  decorate: DecorateFn;
};

export type ToPluginFn = () => Plugin;

export type Pluginable = Plugin | ToPluginFn;

export function createPlugin({
  name,
  plugins = [],
  systems = [],
  components = [],
  decorate = () => {},
}: PluginOptions): Plugin {
  if (!name) throw new Error("ECS: createPlugin requires name");
  return {
    name,
    plugins,
    systems,
    components,
    decorate,
  };
}
