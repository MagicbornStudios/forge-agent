/**
 * Condition Formatter - formats ForgeCondition to Yarn syntax
 */
import type { ForgeCondition } from '@forge/types';
import { CONDITION_OPERATOR, CONDITION_OPERATOR_SYMBOLS } from '@forge/types';

export function formatCondition(cond: ForgeCondition): string {
  const varName = `$${cond.flag}`;

  switch (cond.operator) {
    case CONDITION_OPERATOR.IS_SET:
      return varName;
    case CONDITION_OPERATOR.IS_NOT_SET:
      return `${CONDITION_OPERATOR_SYMBOLS.NOT} ${varName}`;
    case CONDITION_OPERATOR.EQUALS:
      if (cond.value === undefined) return varName;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.EQUALS} ${typeof cond.value === 'string' ? `"${cond.value}"` : cond.value}`;
    case CONDITION_OPERATOR.NOT_EQUALS:
      if (cond.value === undefined) return `${CONDITION_OPERATOR_SYMBOLS.NOT} ${varName}`;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.NOT_EQUALS} ${typeof cond.value === 'string' ? `"${cond.value}"` : cond.value}`;
    case CONDITION_OPERATOR.GREATER_THAN:
      if (cond.value === undefined) return varName;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.GREATER_THAN} ${cond.value}`;
    case CONDITION_OPERATOR.LESS_THAN:
      if (cond.value === undefined) return varName;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.LESS_THAN} ${cond.value}`;
    case CONDITION_OPERATOR.GREATER_EQUAL:
      if (cond.value === undefined) return varName;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.GREATER_EQUAL} ${cond.value}`;
    case CONDITION_OPERATOR.LESS_EQUAL:
      if (cond.value === undefined) return varName;
      return `${varName} ${CONDITION_OPERATOR_SYMBOLS.LESS_EQUAL} ${cond.value}`;
    default:
      return varName;
  }
}

export function formatConditions(conditions: ForgeCondition[]): string {
  return conditions.map(formatCondition).filter((c) => c.length > 0).join(` ${CONDITION_OPERATOR_SYMBOLS.AND} `);
}
