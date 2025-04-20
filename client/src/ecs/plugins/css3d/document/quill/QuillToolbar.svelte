<script lang="ts">
import { fontSizes } from "./quillInit"
import { UNIQUE_COLOR_PALETTE } from "~/config/constants"

export let toolbar
</script>

<div class="toolbar" bind:this={toolbar}>
  <div class="ql-formats">
    <select class="ql-font">
      <option selected value="">Sans Serif</option>
      <option value="quicksand">Quicksand</option>
      <option value="garamond">Garamond</option>
      <option value="oswald">Oswald</option>
      <option value="squarepeg">Square Peg</option>
    </select>
  </div>
  <div class="ql-formats">
    <select class="ql-size">
      {#each fontSizes as size}
        <option value={size}>{size.replace("px", "")}</option>
      {/each}
    </select>
  </div>

  <div class="ql-formats">
    <select class="ql-align">
      <option value="" />
      <option value="center" />
      <option value="right" />
    </select>
    <select class="ql-color">
      {#each UNIQUE_COLOR_PALETTE as color}
        <option value={color} />
      {/each}
    </select>
    <select class="ql-background">
      {#each UNIQUE_COLOR_PALETTE as color}
        <option value={color} />
      {/each}
    </select>
  </div>

  <div class="ql-formats">
    <button class="ql-bold" />
    <button class="ql-italic" />
    <button class="ql-strike" />
  </div>

  <div class="ql-formats">
    <button class="ql-link" />
    <button class="ql-image" />
  </div>

  <div class="ql-formats">
    <button class="ql-list" value="ordered" />
    <button class="ql-list" value="bullet" />
  </div>

  <div class="ql-formats">
    <button class="ql-blockquote" />
    <button class="ql-clean" />
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    background-color: var(--background-transparent-gray, black);
    color: var(--foreground-white, white);
    border-radius: 5px;
  }

  .toolbar :global(.ql-formats) {
    display: flex;
  }

  .toolbar :global(.ql-font span[data-label="Sans Serif"]::before) {
    font-family: Helvetica, Arial, sans-serif;
  }

  .toolbar :global(.ql-font span[data-label="Quicksand"]::before) {
    font-family: "Quicksand";
  }

  .toolbar :global(.ql-font span[data-label="Garamond"]::before) {
    font-family: "Cormorant Garamond";
  }

  .toolbar :global(.ql-font span[data-label="Oswald"]::before) {
    font-family: "Oswald";
  }

  .toolbar :global(.ql-font span[data-label="Square Peg"]::before) {
    font-family: "Square Peg";
  }
</style>
