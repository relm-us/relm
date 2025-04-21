const HEX_COLOR_CODE_REGEX = /^#[A-Fa-f0-9]{6}$/

export function isValidColor(color: string) {
  return HEX_COLOR_CODE_REGEX.test(color)
}
