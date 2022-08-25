import { SvelteComponent } from "svelte";

export type Cut = [{ x: number; y: number }, { x: number; y: number }];
export type Circle = { x: number; y: number; diameter: number };
export type CutCircle = {
  x: number;
  y: number;
  diameter: number;
  cuts: Cut[];
  visible: boolean;
  component: SvelteComponent;
};
