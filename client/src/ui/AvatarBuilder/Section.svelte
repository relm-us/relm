<script lang="ts">
  export let name;
  export let first = false;
  export let last = false;
</script>

<div class="section" class:first class:last>
  <div class="title"><span>{name}</span></div>
  <slot />
</div>

<style>
  .section {
    margin-top: 8px;
    padding-bottom: 10px;
  }
  .section.first {
    margin-top: 0px;
  }
  .section.first > .title {
    border-top-color: transparent;
  }
  .title {
    color: var(--selected-orange);
    font-size: 16px;
    margin: 4px 0;
  }
</style>
