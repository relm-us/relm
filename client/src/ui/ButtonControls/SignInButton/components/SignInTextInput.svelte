<script lang="ts">

  export let label = "";
  export let type : "text"|"email"|"password" = "text";
  export let name;

</script>

<r-signin-text-input>
  <input type={type} placeholder={label} name={name} />
</r-signin-text-input>

<style lang="scss">
  r-signin-text-input {
    width: 100%;
    height: 3em;
  }

  input {
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 1.8em;
    background-image: radial-gradient(circle, #d3ad0b, #a77822);
    color: #ffffff;
    border: none;
    outline: none;
    border-radius: 5px;
  }

  input::placeholder {
    color: #ffffff;
    text-transform: capitalize;
  }

  // Hide the placeholder text when the element is in focus
  input:focus::placeholder {
    opacity: 0;
  }


  // Glowing animation when the input is clicked
  input:focus {
    animation: glow;
    animation-duration: 3s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes glow {
    0% {
      box-shadow: #bf8823 0 0 0 0;
    }
    50% {
      box-shadow: #bf8823 0 0 10px 10px;
    }
  }

</style>