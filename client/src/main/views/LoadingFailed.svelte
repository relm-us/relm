<script>
import PageOverlay from "~/ui/lib/PageOverlay"
import { _ } from "~/i18n"
</script>

<PageOverlay zIndex={6}>
  <h1>{$_("loading.failed.title", { default: "Oh!" })}</h1>
  <h2>
    {$_("loading.failed.unable_to_load", {
      default: "Unable to load this relm.",
    })}
  </h2>
</PageOverlay>

<style>
  h1 {
    font-size: 48px;
    color: white;
  }
  h2 {
    font-size: 32px;
    color: rgba(200, 200, 200, 1);
  }
</style>
