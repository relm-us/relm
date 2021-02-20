<script>
  export let content;
  export let hanchor;

  // ignore warning about missing props
  $$props;
</script>

<div class="bubble" class:right={hanchor === 2} class:left={hanchor === 1}>
  {content}
</div>

<style lang="scss">
  .bubble {
    display: inline-block;

    position: relative;
    padding: 15px 20px;
    border-radius: 10px;
    border: 2px solid black;
    background: white;
    /* font-family: "Permanent Marker"; */
    clear: both;

    &:before {
      content: "";
      position: absolute;
      bottom: -50px;
      height: 50px;
      width: 90px;
    }

    &.left {
      float: left;
      margin: 0px 100px 50px 0px;
      &:before {
        border-radius: 0 0 100%;
        box-shadow: -2px -2px 0 -0.5px #000 inset, -20px 0px 0px 0px #fff inset,
          -22px -1px 0 0px #000 inset;
        // box-shadow: -2px -2px 0 0 #000 inset, -23px 0 0 0 #fff inset,
        //   -25px -2px 0 0 #000 inset;
        left: 0;
      }
    }
    &.right {
      float: right;
      margin: 0px 0px 50px 100px;
      &:before {
        border-radius: 0 0 0 100%;
        box-shadow: 2px -2px 0 -0.5px #000 inset, 20px 0 0 0 #fff inset,
          22px -1px 0 0 #000 inset;
        right: 0;
      }
    }
    // For "think" and "yell" see https://codepen.io/quatmo/pen/jVoXQe
  }
</style>
