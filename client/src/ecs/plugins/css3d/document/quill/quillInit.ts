import Quill from "quill";
import QuillCursors from "quill-cursors";
import { QuillBinding } from "y-quill";

import { worldManager } from "~/world";

// prettier-ignore
export const fontSizes = [
  "12px", "16px", "20px", "24px", "28px",
  "32px", "36px", "40px", "48px", "80px",
  "100px", "150px"
];

Quill.register("modules/cursors", QuillCursors);

// Allowed fonts. We do not add "Sans Serif" since it is the default.
let Font = Quill.import("formats/font");
Font.whitelist = ["quicksand", "garamond", "oswald", "squarepeg"];
Quill.register(Font, true);

// Allowed font sizes.
var Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizes;
Quill.register(Size, true);

export function quillInit(
  container,
  toolbar,
  { cursors = true, readOnly = false, bounds = container }
) {
  const editor = new Quill(container, {
    modules: {
      cursors,
      toolbar,
    },
    placeholder: "Start collaborating...",
    theme: "snow", // or 'bubble'
    bounds,
    readOnly,
  });

  return editor;
}

// Bind Quill to a yjs document, and return an unbind function
export function quillBind(docId, editor) {
  let binding;

  worldManager.afterInit(() => {
    const wdoc = worldManager.worldDoc;
    binding = new QuillBinding(
      wdoc.ydoc.getText(docId),
      editor,
      wdoc.provider.awareness
    );
  });

  return () => {
    if (binding) binding.destroy();
  };
}
