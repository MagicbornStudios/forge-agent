/**
 * Yarn block type constants
 */
export const CONDITION_BLOCK_TYPE = {
  IF: 'if',
  ELSEIF: 'elseif',
  ELSE: 'else',
  ENDIF: 'endif',
} as const;

export type ConditionBlockType = typeof CONDITION_BLOCK_TYPE[keyof typeof CONDITION_BLOCK_TYPE];
