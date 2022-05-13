import Quill from "quill";
import QuillCursors from "quill-cursors";
import { QuillBinding } from "y-quill";

import { worldManager } from "~/world";

// prettier-ignore
export const fontSizes = [
  "12px", "16px", "20px", "24px", "28px",
  "32px", "48px", "80px", "100px", "150px"
];

// prettier-ignore
export const fontColors = [
  "#000000","#434343","#999999","#cccccc","#efefef",
  "#ae081e","#ad4736","#c0775c","#ebc9b2","#521510",
  "#cd5432","#c45f2b","#eb8572","#f4b490","#9e440d",
  "#e58d27","#f0b526","#f2d631","#ece6ba","#c78b35",
  "#10866f","#6cb47c","#89cf82","#cef5e1","#225f34",
  "#086b75","#2188dd","#67b7d4","#81e2ea","#5d80b4",
  "#696daa","#906aa1","#d8bbcd","#c9ceec","#4f3b47",
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
  { cursors = true, readOnly = false }
) {
  const editor = new Quill(container, {
    modules: {
      cursors,
      toolbar,
    },
    placeholder: "Start collaborating...",
    theme: "snow", // or 'bubble'
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
