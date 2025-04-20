import Quill from "quill"
import QuillCursors from "quill-cursors"
import ImageUploader from "quill-image-uploader"
import { QuillBinding } from "y-quill"
import { config } from "~/config"

import { worldManager } from "~/world"

export { Quill }

/* Handy way to debug Quill events if needed */
// Quill.debug(true);

// prettier-ignore
export const fontSizes = [
  "12px",
  "16px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
  "80px",
  "100px",
  "150px",
]

Quill.register("modules/cursors", QuillCursors)
Quill.register("modules/imageUploader", ImageUploader)

// Allowed fonts. We do not add "Sans Serif" since it is the default.
const Font = Quill.import("formats/font")
Font.whitelist = ["quicksand", "garamond", "oswald", "squarepeg"]
Quill.register(Font, true)

// Allowed font sizes.
const Size = Quill.import("attributors/style/size")
Size.whitelist = fontSizes
Quill.register(Size, true)

export function quillInit(
  container,
  toolbar,
  { cursors = true, readOnly = false, bounds = container, emptyFormat = null, placeholder = null },
): Quill {
  const modules = {
    cursors,
    toolbar,
  } as any

  if (toolbar) {
    // The imageUploader REQUIRES the toolbar module to be active.
    modules.imageUploader = {
      upload: (file) =>
        new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append("file", file)

          fetch(config.serverUploadUrl, {
            method: "POST",
            body: formData,
          })
            .then((r) => r.json())
            .then((result) => resolve(`${config.serverUrl}/asset/${result.files.png}`))
            .catch((error) => {
              reject("Upload failed")
              console.error("Upload failure:", error)
            })
        }),
    }
  }
  const editor = new Quill(container, {
    modules,
    placeholder,
    theme: "snow",
    bounds,
    readOnly,
  })

  if (emptyFormat) {
    editor.on("editor-change", (changeType, to, from) => {
      const isBlank = editor.getText() === "\n"
      if (!isBlank) return

      if (changeType === "selection-change" && from === null && isBlank) {
        applyFormats(editor, emptyFormat)
      } else if (changeType === "text-change") {
        applyFormats(editor, emptyFormat)
      }
    })
  }

  return editor
}

// Set the "current" formatting for the quill editor
// e.g. "size", "36px"; "font", "quicksand"; "color", "#000000"
function applyFormats(editor: Quill, formats: Record<string, string>) {
  for (let [key, value] of Object.entries(formats)) {
    editor.format(key, value)
  }
}

// Bind Quill to a yjs document, and return an unbind function
export function quillBind(docId: string, editor: Quill) {
  let binding

  worldManager.afterInit(() => {
    const ytext = worldManager.worldDoc.getDocument(docId)
    binding = new QuillBinding(ytext, editor, worldManager.broker.slow)
  })

  return () => {
    if (binding) {
      binding.destroy()
    }
  }
}
