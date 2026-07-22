const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevelName = (process.env.REACT_APP_LOG_LEVEL || "debug").toLowerCase();

function getLevelValue(name) {
  return LEVELS[name] ?? 0;
}

export function setLevel(name) {
  currentLevelName = name;
}

function shouldLog(level) {
  return getLevelValue(level) >= getLevelValue(currentLevelName);
}

function prefix(level) {
  return `[resume] [${level.toUpperCase()}]`;
}

export function debug(...args) {
  if (!shouldLog("debug")) return;
  console.log(prefix("debug"), ...args);
}

export function info(...args) {
  if (!shouldLog("info")) return;
  console.info(prefix("info"), ...args);
}

export function warn(...args) {
  if (!shouldLog("warn")) return;
  console.warn(prefix("warn"), ...args);
}

export function error(...args) {
  if (!shouldLog("error")) return;
  console.error(prefix("error"), ...args);
}

const logger = { setLevel, debug, info, warn, error };

export default logger;
