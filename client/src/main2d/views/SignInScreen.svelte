<script lang="ts">
import { onMount } from "svelte"
import { toast } from "@zerodevx/svelte-toast"

import { env } from "~/config"
import { LoginManager } from "~/identity/LoginManager"
import SignInDialog from "~/ui/Dialogs/SignInDialog.svelte"
import SignUpDialog from "~/ui/Dialogs/SignUpDialog.svelte"

import Background from "./components/Background.svelte"

export let api
export let dispatch

let loginManager
let state: "SIGN_IN" | "SIGN_UP" = "SIGN_IN"

onMount(async () => {
  loginManager = new LoginManager(api, {
    notify: (text: string) => toast.push(text),
  })
})
</script>

<Background />

{#if state === "SIGN_IN"}
  <SignInDialog
    canCancel={false}
    on:success={() => dispatch({ id: "didSignIn" })}
    on:cancel={() => window.open(env.home)}
    on:signup={() => (state = "SIGN_UP")}
    {loginManager}
  />
{:else}
  <SignUpDialog
    canCancel={false}
    on:success={() => dispatch({ id: "didSignIn" })}
    on:cancel={() => window.open(env.home)}
    on:signin={() => (state = "SIGN_IN")}
    {loginManager}
  />
{/if}
