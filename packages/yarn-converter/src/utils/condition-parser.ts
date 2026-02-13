/**
 * Condition Parser - parses Yarn condition syntax to ForgeCondition[]
 */
import type { ForgeCondition } from '@forge/types';
import { CONDITION_OPERATOR } from '@forge/types';

const CONDITION_SEPARATOR = /\s+(?:and|&&)\s+/i;
const NOT_FLAG_PATTERN = /^(?:not|!)\s+\$(\w+)/i;
const EQUALS_PATTERN = /\$(\w+)\s*(?:==|eq|is)\s+(.+)/i;
const NOT_EQUALS_PATTERN = /\$(\w+)\s*(?:!=|neq)\s+(.+)/i;
const GREATER_EQUAL_PATTERN = /\$(\w+)\s*(?:>=|gte)\s+(.+)/i;
const LESS_EQUAL_PATTERN = /\$(\w+)\s*(?:<=|lte)\s+(.+)/i;
const GREATER_THAN_PATTERN = /\$(\w+)\s*(?:>|gt)\s+(.+)/i;
const LESS_THAN_PATTERN = /\$(\w+)\s*(?:<|lt)\s+(.+)/i;
const FLAG_VARIABLE_PATTERN = /\$(\w+)/;
const QUOTE_REMOVAL = /^["']|["']$/g;

function parseValue(valueStr: string): boolean | number | string {
  const unquoted = valueStr.replace(QUOTE_REMOVAL, '');
  const num = parseFloat(unquoted);
  if (!isNaN(num) && isFinite(num)) return num;
  if (unquoted === 'true') return true;
  if (unquoted === 'false') return false;
  return unquoted;
}

function normalizeNumericValue(value: boolean | number | string): number | boolean | string {
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  if (!isNaN(num) && isFinite(num)) return num;
  return value;
}

export function parseCondition(conditionStr: string): ForgeCondition[] {
  const conditions: ForgeCondition[] = [];
  const parts = conditionStr.split(CONDITION_SEPARATOR);

  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;

    const notMatch = p.match(NOT_FLAG_PATTERN);
    if (notMatch) {
      conditions.push({ flag: notMatch[1], operator: CONDITION_OPERATOR.IS_NOT_SET });
      continue;
    }

    const eqMatch = p.match(EQUALS_PATTERN);
    if (eqMatch) {
      conditions.push({ flag: eqMatch[1], operator: CONDITION_OPERATOR.EQUALS, value: parseValue(eqMatch[2].trim()) });
      continue;
    }

    const neqMatch = p.match(NOT_EQUALS_PATTERN);
    if (neqMatch) {
      conditions.push({ flag: neqMatch[1], operator: CONDITION_OPERATOR.NOT_EQUALS, value: parseValue(neqMatch[2].trim()) });
      continue;
    }

    const gteMatch = p.match(GREATER_EQUAL_PATTERN);
    if (gteMatch) {
      conditions.push({ flag: gteMatch[1], operator: CONDITION_OPERATOR.GREATER_EQUAL, value: normalizeNumericValue(parseValue(gteMatch[2].trim())) });
      continue;
    }

    const lteMatch = p.match(LESS_EQUAL_PATTERN);
    if (lteMatch) {
      conditions.push({ flag: lteMatch[1], operator: CONDITION_OPERATOR.LESS_EQUAL, value: normalizeNumericValue(parseValue(lteMatch[2].trim())) });
      continue;
    }

    const gtMatch = p.match(GREATER_THAN_PATTERN);
    if (gtMatch) {
      conditions.push({ flag: gtMatch[1], operator: CONDITION_OPERATOR.GREATER_THAN, value: normalizeNumericValue(parseValue(gtMatch[2].trim())) });
      continue;
    }

    const ltMatch = p.match(LESS_THAN_PATTERN);
    if (ltMatch) {
      conditions.push({ flag: ltMatch[1], operator: CONDITION_OPERATOR.LESS_THAN, value: normalizeNumericValue(parseValue(ltMatch[2].trim())) });
      continue;
    }

    const varMatch = p.match(FLAG_VARIABLE_PATTERN);
    if (varMatch) {
      conditions.push({ flag: varMatch[1], operator: CONDITION_OPERATOR.IS_SET });
    }
  }

  return conditions;
}
