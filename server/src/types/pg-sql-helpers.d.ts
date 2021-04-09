declare module "pg-sql-helpers" {
  /**
   * Create a SQL "where" clause with `params` and optional `ident`.
   *
   * @param {String} ident
   * @param {Object} params
   * @return {sql}
   */
  export function WHERE(ident: string, params?: Object, ...args: any[]): any;
  /**
   * Create a list of placeholders for the values of an `object`.
   *
   * @param {Object} object
   * @return {sql}
   */
  export function VALUES(object: Object): any;
  /**
   * Create a SQL "UPDATE" clause for `table` with `values`.
   *
   * @param {String} table
   * @param {Object} values
   * @return {sql}
   */
  export function UPDATE(table: string, values: Object): any;
  /**
   * Create a SQL sort expression.
   *
   * @param {String} table (optional)
   * @param {String} column
   * @return {sql}
   */
  export function SORT(table: string, column: string, ...args: any[]): any;
  /**
   * Create a SQL "SELECT" clause for `table` with `values`.
   *
   * @param {String} table
   * @param {Object|Array<String>|Array<Object>} values
   * @return {sql}
   */
  export function SELECT(
    table: string,
    values: Object | Array<string> | Array<Object>
  ): any;
  /**
   * Create a SQL `ROW` expression for the values of an `object`.
   *
   * @param {Object} object
   * @return {sql}
   */
  export function ROW(object: Object): any;
  /**
   * Create a SQL "ORDER BY" string from `sorts`.
   *
   * @param {String} table (optional)
   * @param {Array} sorts
   * @return {sql}
   */
  export function ORDER_BY(table: string, sorts: any[]): any;
  /**
   * Create a literal SQL "OFFSET" string from `number`.
   *
   * @param {Number} number
   * @param {Object} options
   * @return {sql}
   */
  export function OFFSET(number: number, ...args: any[]): any;
  /**
   * Create a literal SQL "LIMIT" string from `number`.
   *
   * @param {Number} number
   * @param {Object} options
   * @return {sql}
   */
  export function LIMIT(number: number, ...args: any[]): any;
  /**
   * Create a SQL "INSERT" statement from a dictionary or list of `values`.
   *
   * @param {String} table
   * @param {Object|Array<Object>} values
   * @return {sql}
   */
  export function INSERT(table: string, values: Object | Array<Object>): any;
  /**
   * Create a list SQL composite values for the values of an `array` of objects.
   *
   * @param {Array} array
   * @return {sql}
   */
  export function COMPOSITES(array: any[]): any;
  /**
   * Create a SQL composite value for the values of an `object`.
   *
   * @param {Object} object
   * @return {sql}
   */
  export function COMPOSITE(object: Object): any;
  /**
   * Create a list of SQL identifiers from a `value`.
   *
   * @param {String} table (optional)
   * @param {Object|Array<Object>|Array<String>} value
   * @return {sql}
   */
  export function COLUMNS(
    table: string,
    value: Object | Array<Object> | Array<string>,
    ...args: any[]
  ): any;
  /**
   * Create a SQL column expression, with optional table reference.
   *
   * @param {String} table (optional)
   * @param {String} column
   * @return {sql}
   */
  export function COLUMN(table: string, column: string): any;

  export function AND(ident: any, params: any, ...args: any[]): any;
  /**
   * Create a SQL "OR" clause, just like "WHERE".
   *
   * @param {String} ident
   * @param {Object} params
   * @param {Object} options
   * @return {sql}
   */
  export function OR(ident: string, params: Object, ...args: any[]): any;
}
