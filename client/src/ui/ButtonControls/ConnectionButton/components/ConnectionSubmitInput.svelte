<script lang="ts">
  export let label = "";
</script>

<r-connection-submit-input>
  <input type="submit" value={label} />
</r-connection-submit-input>

<style>
    input[type="submit"] {
    color: #7f7f7f;
    font-size: 4em;
    background: none;
    border: none;
    outline: none;
  }

  input[type="submit"]:hover, input[type="submit"]:focus {
    text-decoration: underline;
    cursor: pointer;
  }
</style>