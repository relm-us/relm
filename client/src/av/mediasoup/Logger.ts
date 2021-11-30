import debug, { Debugger } from "debug";

const APP_NAME = 'conference';

export class Logger {
  _debug: Debugger;
  _warn: Debugger;
  _error: Debugger;

  constructor(prefix) {
    if (prefix) {
      this._debug = debug(`${APP_NAME}:${prefix}`);
      this._warn = debug(`${APP_NAME}:warn:${prefix}`);
      this._error = debug(`${APP_NAME}:error:${prefix}`);
    } else {
      this._debug = debug(APP_NAME);
      this._warn = debug(`${APP_NAME}:warn`);
      this._error = debug(`${APP_NAME}:error`);
    }

    this._debug.log = console.info.bind(console);
    this._warn.log = console.warn.bind(console);
    this._error.log = console.error.bind(console);
  }

  get debug() {
    return this._debug;
  }

  get warn() {
    return this._warn;
  }

  get error() {
    return this._error;
  }
}
