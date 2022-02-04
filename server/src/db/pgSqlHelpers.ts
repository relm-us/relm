import is from "is";
import { isPlainObject } from "../utils/isPlainObject";
import { sql } from "pg-sql";

/**
 * A map of operators shorthands to PostgreSQL operators.
 */
const WHERE_OPERATORS = {
  "eq": "=",
  "gt": ">",
  "gte": ">=",
  "lt": "<",
  "lte": "<=",
  "ne": "!=",
  "neq": "!=",
  "like": "LIKE",
  "ilike": "ILIKE",
  "search": "@@",
  "@>": "@>",
};

/**
 * Create a SQL "AND" clause, just like "WHERE".
 *
 * @return {sql}
 */
export function AND(
  ident: any,
  params: any,
  options: { keyword?: string; delimiter?: string } = {}
): any {
  const query = WHERE(ident, params, { ...options, keyword: "AND" });
  return query;
}

/**
 * Create a SQL "OR" clause, just like "WHERE".
 *
 * @return {sql}
 */
export function OR(
  ident: any,
  params: any,
  options: { keyword?: string; delimiter?: string } = {}
) {
  const query = WHERE(ident, params, { ...options, keyword: "OR" });
  return query;
}

/**
 * Create a SQL column expression, with optional table reference.
 *
 * @return {sql}
 */
export function COLUMN(table: string, column?: string): any {
  if (column == null) {
    column = table;
    table = null;
  }

  const ref = table
    ? sql`${sql.ident(table, column)}`
    : sql`${sql.ident(column)}`;

  return ref;
}

/**
 * Create a list of SQL identifiers from a `value`.
 *
 * @return {sql}
 */
export function COLUMNS(
  table: string | object | object[] | string[],
  value?: object | object[] | string[],
  options: { delimiter?: string } = {}
): any {
  let table_: string;
  let value_: object | object[] | string[];

  if (table != null && !is.string(table)) {
    table_ = null;
    value_ = table as any;
  } else {
    table_ = table as any;
    value_ = value;
  }

  const { delimiter = ", " } = options;
  let keys;

  if (is.object(value_)) {
    keys = getDefinedKeys(value_);
  } else if (is.array(value_) && is.object(value_[0])) {
    keys = getDefinedKeys(value_[0]);
  } else if (is.array(value_) && is.string(value_[0])) {
    keys = value_;
  } else {
    throw new Error(
      `The \`COLUMNS\` SQL helper must be passed an object, an array of objects or an array of strings, but you passed: ${value_}`
    );
  }

  const idents = keys.map((k) => COLUMN(table_, k));
  const query = sql`${sql.join(idents, delimiter)}`;
  return query;
}

/**
 * Create a SQL composite value for the values of an `object`.
 *
 * @return {sql}
 */
export function COMPOSITE(object: Object): any {
  if (!is.object(object)) {
    throw new Error(
      `The \`COMPOSITE\` SQL helper must be passed an object, but you passed: ${object}`
    );
  }

  const keys = getDefinedKeys(object);
  const vals = keys.map((k) => sql`${object[k]}`);
  const query = sql`(${sql.join(vals, ", ")})`;
  return query;
}

/**
 * Create a list SQL composite values for the values of an `array` of objects.
 *
 * @return {sql}
 */
export function COMPOSITES(arr: Object | Object[]): any {
  let array: Object[];
  if (!Array.isArray(arr)) {
    array = [arr];
  } else {
    array = arr;
  }

  let columns;
  const composites = array.map((object, i) => {
    const composite = COMPOSITE(object);
    const keys = getDefinedKeys(object);
    const cols = keys.join(",");

    if (i === 0) {
      columns = cols;
    } else if (cols !== columns) {
      throw new Error(
        `Every entry in a SQL composite expression must have the same columns, but you passed: ${array}`
      );
    }

    return composite;
  });

  const query = sql.join(composites, ", ");
  return query;
}

/**
 * Create a SQL "INSERT" statement from a dictionary or list of `values`.
 *
 * @return {sql}
 */
export function INSERT(table: string, values: object | object[]): any {
  const query = sql`INSERT INTO ${sql.ident(table)} (${COLUMNS(
    values
  )}) ${VALUES(values)}`;
  return query;
}

/**
 * Create a literal SQL "LIMIT" string from `number`.
 *
 * @return {sql}
 */
export function LIMIT(number: number, options: { max?: number } = {}): any {
  if (number == null) {
    return sql``;
  }

  if (options.max) {
    number = Math.min(number, options.max);
  }

  const query = number === Infinity ? sql`LIMIT ALL` : sql`LIMIT ${number}`;

  return query;
}

/**
 * Create a literal SQL "OFFSET" string from `number`.
 *
 * @return {sql}
 */
export function OFFSET(number: number, options: { max?: number } = {}): any {
  if (number == null) {
    return sql``;
  }

  if (options.max) {
    number = Math.min(number, options.max);
  }

  const query = sql`OFFSET ${number}`;
  return query;
}

/**
 * Create a SQL "ORDER BY" string from `sorts`.
 *
 * @return {sql}
 */
export function ORDER_BY(table: string | any[], sorts?: any[]): any {
  let table_;
  let sorts_;
  if (Array.isArray(table)) {
    table_ = null;
    sorts_ = table;
  } else {
    table_ = table;
    sorts_ = sorts;
  }

  if (!Array.isArray(sorts_)) {
    throw new Error(
      `The \`ORDER_BY\` SQL helper must be passed an array of sorting parameters, but you passed: ${sorts_}`
    );
  }

  if (!sorts_.length) {
    return sql``;
  }

  const values = sorts_.map((sort) => SORT(table_, sort));
  const query = sql`ORDER BY ${sql.join(values, ", ")}`;
  return query;
}

/**
 * Create a SQL `ROW` expression for the values of an `object`.
 *
 * @return {sql}
 */
export function ROW(object: Object): any {
  const query = sql`ROW ${COMPOSITE(object)}`;
  return query;
}

/**
 * Create a SQL "SELECT" clause for `table` with `values`.
 */
export function SELECT(
  table: string,
  values: Object | Object[] | string[]
): any {
  if (table != null && !is.string(table)) {
    values = table;
    table = null;
  }

  const query = sql`SELECT ${COLUMNS(table, values)}`;
  return query;
}

/**
 * Create a SQL sort expression.
 *
 * @return {sql}
 */
export function SORT(table: string, column: string, ...args: any[]): any {
  if (arguments.length === 1) {
    column = table;
    table = null;
  }

  let order = "ASC";

  if (column.startsWith("-")) {
    order = "DESC";
    column = column.slice(1);
  }

  return sql`${COLUMN(table, column)} ${sql.raw(order)} NULLS LAST`;
}

/**
 * Create a SQL "UPDATE" clause for `table` with `values`.
 *
 * @return {sql}
 */
export function UPDATE(tab: string, vals: Object): any {
  let table: string;
  let values: Object;
  if (typeof tab != "string") {
    table = null;
    values = tab;
  } else {
    table = tab;
    values = vals;
  }

  if (!is.object(values)) {
    throw new Error(
      `The \`UPDATE\` SQL helper must be passed an object, but you passed: ${values}`
    );
  }

  const keys = getDefinedKeys(values);
  const id = table ? sql`${sql.ident(table)}` : sql``;
  const query =
    keys.length == 1
      ? sql`UPDATE ${id} SET ${COLUMN(keys[0])} = ${values[keys[0]]}`
      : sql`UPDATE ${id} SET (${COLUMNS(values)}) = ${ROW(values)}`;

  return query;
}

/**
 * Create a list of placeholders for the values of an `object`.
 *
 * @return {sql}
 */
export function VALUES(object: Object | Object[]): any {
  if (!Array.isArray(object)) {
    object = [object];
  }

  const query = sql`VALUES ${COMPOSITES(object)}`;
  return query;
}

/**
 * Create a SQL "where" clause with `params` and optional `ident`.
 *
 * @return {sql}
 */
export function WHERE(
  ident: string,
  params?: Object,
  options: { keyword?: string; delimiter?: string } = {}
): any {
  if (is.object(ident)) {
    params = ident;
    ident = "";
  }

  if (params == null) {
    return sql``;
  }

  function handle(keys, obj) {
    const key = keys[keys.length - 1];
    let value = obj[key];
    let operator = WHERE_OPERATORS[key] || "=";

    if (isPlainObject(value)) {
      const ks = getDefinedKeys(value);
      if (ks.length === 0) return;
      ks.forEach((k) => handle([...keys, k], value));
      return;
    }

    if (value === null) {
      value = sql.raw("NULL");
      if (operator === "=") operator = "IS";
      if (operator === "!=") operator = "IS NOT";
    }

    const ref =
      key in WHERE_OPERATORS ? keys.slice(0, -1).join("->") : keys.join("->");
    const id = ident
      ? sql`${sql.ident(ident)}.${sql.ident(ref)}`
      : sql`${sql.ident(ref)}`;
    const clause = sql`${id} ${sql.raw(operator)} ${value}`;
    clauses.push(clause);
  }

  const { keyword = "WHERE", delimiter = "AND" } = options;
  const clauses = [];

  getDefinedKeys(params).forEach((key) => {
    handle([key], params);
  });

  if (clauses.length === 0) {
    return sql``;
  }

  const query = sql`${sql.raw(keyword)} ${sql.join(clauses, ` ${delimiter} `)}`;
  return query;
}

/**
 * Get the keys for an `object` that don't have undefined values.
 *
 * @return {Array}
 */
function getDefinedKeys(object) {
  return Object.keys(object)
    .filter((k) => object[k] !== undefined)
    .sort();
}
