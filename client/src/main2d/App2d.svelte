<script lang="ts">
  import Notifications from "svelte-notifications";

  import SignInScreen from "./SignInScreen.svelte";
  import Dashboard from "./Dashboard.svelte";

  let page = "sign-in";
</script>

<Notifications>
  {#if page === "sign-in"}
    <SignInScreen on:success={() => (page = "dashboard")} />
  {:else if page === "dashboard"}
    <Dashboard />
  {/if}
</Notifications>
