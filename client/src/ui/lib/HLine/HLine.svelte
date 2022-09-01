<r-line>
  <slot />
</r-line>

<style>
  r-line {
    display: flex;
    flex-direction: row;
  }
  r-line:before,
  r-line:after {
    content: "";
    flex: 1 1;
    border-bottom: 1px solid;
    margin: auto;
  }
  r-line:before {
    margin-right: 10px;
  }
  r-line:after {
    margin-left: 10px;
  }
</style>
