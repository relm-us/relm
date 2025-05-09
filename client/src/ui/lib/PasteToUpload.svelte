<script lang="ts">
import { toast } from "@zerodevx/svelte-toast"
import { onMount } from "svelte"

import { worldManager } from "~/world"

import { worldUIMode } from "~/stores"

import { createPrefab } from "~/prefab"
import { makeHDImage } from "~/prefab/makeHDImage"

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.width, height: image.height })
    }

    let fileReader = new FileReader()
    fileReader.onload = () => (image.src = fileReader.result as string)
    fileReader.readAsDataURL(file)
  })
}

onMount(() => {
  document.addEventListener("paste", async (event) => {
    if ($worldUIMode === "build") return

    const item = Array.from(event.clipboardData.items).find((i) => i.kind === "file")

    if (item) {
      const file = item.getAsFile()

      const result = await worldManager.api.upload(file)
      if (result.status === "success") {
        const url = result.files.webp

        let { width, height } = await getImageDimensions(file)

        const largestSide = Math.max(width, height) / 2
        width /= largestSide
        height /= largestSide

        createPrefab(makeHDImage, {
          url,
          w: width,
          h: height,
        })
      } else {
        toast.push("Unable to upload")
      }
    } else {
      console.warn("No image files available to paste")
    }
  })
})
</script>
