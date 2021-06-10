<script lang="ts">
  export let name;
  export let first = false;
  export let last = false;

</script>

<div class="section" class:first class:last>
  <div class="content">
    <span>{name}</span>
    <slot />
  </div>
</div>

<style>
  .section {
    margin-top: -5px;
  }
  .section.first {
    margin-top: 8px;
  }
  .content {
    font-size: 14px;
    border: 1px solid #999;
    border-bottom-color: transparent;
    border-radius: 8px;
    text-align: center;
    padding-bottom: 20px;
  }
  .section.last > .content {
    border-bottom-color: #999;
  }
  .content span {
    color: var(--foreground-white);
    position: relative;
    top: -10px;
    padding: 2px 8px;
    background: #1a1e23;
  }

  .section {
    width: 100%;
    /* border: 1px solid #999; */
    /* border-radius: 8px; */
  }
  /* .content {
    transform: translateY(-12px);
  }
  .title {
    color: var(--foreground-white);
    margin-top: 8px;
    margin-bottom: 6px;
  }

  .center {
    text-align: center;
  } */

</style>
