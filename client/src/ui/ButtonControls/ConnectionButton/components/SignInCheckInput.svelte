<script lang="ts">
  export let label = "";
  export let name;
</script>

<r-signin-check-input>
  <label>
    <input type="checkbox" {name} />
    <span>{label}</span>
  </label>
</r-signin-check-input>

<style lang="scss">
  r-signin-check-input {
    width: 100%;
  }

  input {
    text-align: center;
    font-size: 1.8em;
    background: radial-gradient(circle, #d3ad0b, #a77822);
    border: none;
    outline: none;
    border-radius: 5px;
    transform: scale(2);
  }

  span {
    padding-left: 0.5em;
    color: #7e7e7e;
  }

  label {
    cursor: pointer;
  }

</style>
