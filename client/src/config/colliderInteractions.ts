/**
 *
 * Group Bits:
 * 0x0001 : Object
 * 0x0002 : Ground
 * 0x0004 : Avatar
 *                      groups      mask
 *                      "I am"  "I Interact With"
 *                      ------    ------
 * object               gx0001    mx0007
 * ground               gx0002    mx0007
 * avatar               gx0004    mx0003
 * avatar (builder)     gx0004    mx0002
 *
 * object  x object   gx0001 & mx0007 (1) && gx0001 & mx0007 (1) = true
 * avatar  x object   gx0004 & mx0007 (4) && gx0001 & mx0003 (1) = true
 * builder x object   gx0004 & mx0007 (4) && gx0001 & mx0002 (0) = false
 * avatar  x ground   gx0004 & mx0007 (4) && gx0002 & mx0003 (2) = true
 * builder x ground   gx0004 & mx0007 (4) && gx0002 & mx0002 (2) = true
 * avatar  x avatar   gx0004 & mx0003 (0) && gx0004 & mx0003 (0) = false
 * builder x avatar   gx0004 & mx0002 (0) && gx0004 & mx0003 (0) = false
 */

export const NO_INTERACTION = 0x00010008;
export const OBJECT_INTERACTION = 0x00010007;
export const GROUND_INTERACTION = 0x00020007;
export const AVATAR_INTERACTION = 0x00040003;
export const AVATAR_BUILDER_INTERACTION = 0x00040002;
