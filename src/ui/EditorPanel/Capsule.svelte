<script lang="ts">
  export let label: string;
</script>

<style>
  capsule {
    margin: 4px 8px 4px 0px;
    display: flex;
    font-size: 12px;
  }
  lbl {
    padding: 2px 6px 2px 8px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    text-align: right;
    background-color: rgba(255, 255, 255, 0.45);
    color: black;
    font-weight: bold;
  }
  value {
    min-width: 24px;
    padding: 2px 8px 2px 4px;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    color: #eee;
  }
</style>

<capsule>
  <lbl>{label}</lbl>
  <value>
    <slot />
  </value>
</capsule>
