<script lang="ts">
import type { DecoratedECSWorld } from "~/types"
import type { Dispatch, State } from "../ProgramTypes"

import Viewport from "~/ui/Viewport"
import Overlay from "~/ui/Overlay"
import Input from "~/events/input/Input.svelte"
import PasteToUpload from "~/ui/lib/PasteToUpload.svelte"

export let ecsWorld: DecoratedECSWorld
export let dispatch: Dispatch
export let state: State

$$props
</script>

<Viewport {ecsWorld} />

<Overlay {dispatch} {state} />

<!-- Keyboard, Mouse input -->
<Input world={ecsWorld} />

<PasteToUpload />
