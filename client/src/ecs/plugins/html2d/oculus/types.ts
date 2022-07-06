import { SvelteComponent } from "svelte";

export type Cut = [{ x: number; y: number }, { x: number; y: number }];
export type Circle = { x: number; y: number; r: number };
export type CutCircle = {
  x: number;
  y: number;
  r: number;
  cuts: Cut[];
  component: SvelteComponent;
};
