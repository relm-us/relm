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
    margin-top: -5px;
    padding-bottom: 20px;
  }
  .section.first {
    margin-top: 0px;
  }
  .section.first > .title {
    border-top-color: transparent;
  }
  .title {
    font-size: 14px;
    border-top: 1px solid var(--foreground-dark-gray);
    text-align: center;
  }
  .title span {
    color: var(--foreground-white);
    position: relative;
    top: -10px;
    padding: 2px 8px;
    background: var(--background-gray);
  }

</style>
