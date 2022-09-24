import type { World } from "~/ecs/base";
import type { Physics } from "~/ecs/plugins/physics/Physics";
import type { Presentation } from "~/ecs/plugins/core";
import type { CssPresentation } from "~/ecs/plugins/css3d/base/CssPresentation";
import type { HtmlPresentation } from "~/ecs/plugins/html2d/HtmlPresentation";
import type { Perspective } from "~/ecs/plugins/perspective/Perspective";

export type DecoratedECSWorld = World & {
  physics: Physics;
  presentation: Presentation;
  cssPresentation: CssPresentation;
  htmlPresentation: HtmlPresentation;
  perspective: Perspective;
};
