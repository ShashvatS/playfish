var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-LampWi/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/types.ts
var NUM_CARDS = 54;
var NUM_SETS = 9;
var CARDS_PER_SET = 6;
var NUM_PLAYERS = 6;
var COOKIE_NAME = "clientid";
var GAME_CODE_LENGTH = 10;

// src/game.ts
function checkNum(num, upper) {
  const n = Number(num);
  return num === void 0 || num === null || isNaN(n) || n < 0 || n >= upper;
}
__name(checkNum, "checkNum");
function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}
__name(shuffle, "shuffle");
var Game = class {
  cards;
  numCards;
  numCardsBySet;
  declares;
  declaresLog;
  moves;
  scoreOdd;
  scoreEven;
  lastPlayer;
  lastDeclarePlayer;
  lastDeclareWasCorrect;
  lastDeclareSet;
  createdAt;
  constructor(serialized) {
    if (serialized) {
      this.cards = serialized.cards;
      this.numCards = serialized.numCards;
      this.numCardsBySet = serialized.numCardsBySet;
      this.declares = serialized.declares;
      this.declaresLog = serialized.declaresLog;
      this.moves = serialized.moves;
      this.scoreOdd = serialized.scoreOdd;
      this.scoreEven = serialized.scoreEven;
      this.lastPlayer = serialized.lastPlayer;
      this.lastDeclarePlayer = serialized.lastDeclarePlayer;
      this.lastDeclareWasCorrect = serialized.lastDeclareWasCorrect;
      this.lastDeclareSet = serialized.lastDeclareSet;
      this.createdAt = serialized.createdAt;
    } else {
      this.createdAt = Date.now();
      this.scoreOdd = 0;
      this.scoreEven = 0;
      this.lastPlayer = 0;
      this.lastDeclarePlayer = -1;
      this.lastDeclareWasCorrect = false;
      this.lastDeclareSet = -1;
      this.declares = Array(NUM_SETS).fill(-1);
      this.declaresLog = [];
      this.moves = [];
      this.numCards = Array(NUM_PLAYERS).fill(9);
      this.numCardsBySet = Array.from(
        { length: NUM_PLAYERS },
        () => Array(NUM_SETS).fill(0)
      );
      this.cards = Array.from(
        { length: NUM_CARDS },
        (_, i) => Math.floor(i * NUM_PLAYERS / NUM_CARDS)
      );
      shuffle(this.cards);
      for (let i = 0; i < NUM_CARDS; i++) {
        const player = this.cards[i];
        const set = Math.floor(i / CARDS_PER_SET);
        this.numCardsBySet[player][set]++;
      }
    }
  }
  update(player, data) {
    if (data.type === "ask") {
      const { card, other } = data;
      if (this.lastPlayer !== player || checkNum(other, NUM_PLAYERS) || checkNum(card, NUM_CARDS) || player % 2 === other % 2)
        return;
      const set = Math.floor(card / CARDS_PER_SET);
      if (this.numCards[other] === 0)
        return;
      if (this.numCardsBySet[player][set] === 0)
        return;
      if (this.cards[card] === other) {
        this.cards[card] = player;
        this.numCards[player]++;
        this.numCardsBySet[player][set]++;
        this.numCards[other]--;
        this.numCardsBySet[other][set]--;
        this.moves.push([player, other, card, 1]);
      } else {
        this.lastPlayer = other;
        this.moves.push([player, other, card, 0]);
      }
    } else if (data.type === "declare") {
      const { set } = data;
      if (checkNum(set, NUM_SETS) || this.declares[set] !== -1)
        return;
      const declareRecord = data;
      for (let i = 0; i < CARDS_PER_SET; i++) {
        const assigned = Number(declareRecord[String(i)]);
        if (checkNum(assigned, NUM_PLAYERS) || assigned % 2 !== player % 2)
          return;
      }
      let success = true;
      for (let i = 0; i < CARDS_PER_SET; i++) {
        const card = set * CARDS_PER_SET + i;
        if (this.cards[card] !== Number(declareRecord[String(i)])) {
          success = false;
          break;
        }
      }
      this.lastDeclarePlayer = player;
      this.lastDeclareSet = set;
      this.lastDeclareWasCorrect = success;
      if (success) {
        if (player % 2 === 1) {
          this.scoreOdd++;
          this.declares[set] = 3;
        } else {
          this.scoreEven++;
          this.declares[set] = 2;
        }
      } else {
        if (player % 2 === 1) {
          this.scoreEven++;
          this.declares[set] = 1;
        } else {
          this.scoreOdd++;
          this.declares[set] = 0;
        }
      }
      this.declaresLog.push(set);
      for (let i = 0; i < NUM_PLAYERS; i++) {
        this.numCards[i] -= this.numCardsBySet[i][set];
        this.numCardsBySet[i][set] = 0;
      }
      for (let i = 0; i < CARDS_PER_SET; i++) {
        this.cards[set * CARDS_PER_SET + i] = -1;
      }
    } else if (data.type === "transfer") {
      const { other } = data;
      if (checkNum(other, NUM_PLAYERS) || Number(other) % 2 !== player % 2 || this.lastPlayer !== player)
        return;
      this.lastPlayer = Number(other);
    }
  }
  getData(player) {
    const playerCards = [];
    for (let i = 0; i < NUM_CARDS; i++) {
      if (this.cards[i] === player)
        playerCards.push(i);
    }
    return {
      cards: playerCards,
      lastMove: this.moves.length > 0 ? this.moves[this.moves.length - 1] : null,
      scoreOdd: this.scoreOdd,
      scoreEven: this.scoreEven,
      turn: this.lastPlayer,
      numCards: this.numCards,
      declares: this.declares,
      declaresLog: this.declaresLog,
      lastDeclare: {
        player: this.lastDeclarePlayer,
        set: this.lastDeclareSet,
        success: this.lastDeclareWasCorrect
      }
    };
  }
  serialize() {
    return {
      cards: this.cards,
      numCards: this.numCards,
      numCardsBySet: this.numCardsBySet,
      declares: this.declares,
      declaresLog: this.declaresLog,
      moves: this.moves,
      scoreOdd: this.scoreOdd,
      scoreEven: this.scoreEven,
      lastPlayer: this.lastPlayer,
      lastDeclarePlayer: this.lastDeclarePlayer,
      lastDeclareWasCorrect: this.lastDeclareWasCorrect,
      lastDeclareSet: this.lastDeclareSet,
      createdAt: this.createdAt
    };
  }
};
__name(Game, "Game");

// src/game-room.ts
function parseCookies(cookieHeader) {
  if (!cookieHeader)
    return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const eqIdx = c.indexOf("=");
      if (eqIdx === -1)
        return [c.trim(), ""];
      return [c.slice(0, eqIdx).trim(), c.slice(eqIdx + 1).trim()];
    })
  );
}
__name(parseCookies, "parseCookies");
var GameRoom = class {
  constructor(ctx, env2) {
    this.ctx = ctx;
    this.env = env2;
    this.ctx.blockConcurrencyWhile(async () => {
      await this.loadFromStorage();
    });
  }
  game = null;
  names = Array.from(
    { length: NUM_PLAYERS },
    (_, i) => `Player ${i + 1}`
  );
  // Which cookie holds each player slot (null = slot open)
  playerCookies = Array(NUM_PLAYERS).fill(null);
  // Spectators: cookie → player number they are watching
  spectators = /* @__PURE__ */ new Map();
  gameCode = "";
  async loadFromStorage() {
    const stored = await this.ctx.storage.get("roomState");
    if (!stored)
      return;
    this.game = new Game(stored.gameData);
    this.names = stored.names;
    this.playerCookies = stored.playerCookies;
    this.gameCode = stored.gameCode;
    for (const [cookie, playerNum] of Object.entries(stored.spectators)) {
      this.spectators.set(cookie, playerNum);
    }
  }
  async saveToStorage() {
    if (!this.game)
      return;
    const state = {
      gameData: this.game.serialize(),
      names: this.names,
      playerCookies: this.playerCookies,
      spectators: Object.fromEntries(this.spectators),
      gameCode: this.gameCode,
      createdAt: this.game.createdAt
    };
    await this.ctx.storage.put("roomState", state);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/create") {
      return this.handleCreate(url.searchParams.get("gameId") ?? "");
    }
    if (url.pathname === "/exists") {
      return Response.json({ exists: this.game !== null });
    }
    if (url.pathname === "/ws") {
      return this.handleWebSocketUpgrade(request);
    }
    return new Response("Not Found", { status: 404 });
  }
  handleCreate(gameId) {
    if (this.game !== null) {
      return Response.json({ error: "Game already exists" }, { status: 409 });
    }
    this.game = new Game();
    this.gameCode = gameId;
    this.ctx.blockConcurrencyWhile(() => this.saveToStorage());
    return Response.json({ success: true });
  }
  handleWebSocketUpgrade(request) {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }
    const cookies = parseCookies(request.headers.get("Cookie"));
    const clientId = cookies[COOKIE_NAME];
    if (!clientId) {
      return new Response("Missing client ID cookie", { status: 400 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [clientId]);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, message) {
    const tags = this.ctx.getTags(ws);
    const clientId = tags[0];
    let parsed;
    try {
      const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
      parsed = JSON.parse(raw);
    } catch {
      this.send(ws, { event: "error", message: "Invalid JSON" });
      return;
    }
    const { event } = parsed;
    switch (event) {
      case "join":
        await this.handleJoin(ws, clientId, parsed);
        break;
      case "watch":
        await this.handleWatch(ws, clientId, parsed);
        break;
      case "makemove":
        await this.handleMakeMove(ws, clientId, parsed);
        break;
      case "gamestate":
        this.handleGameStateRequest(ws, clientId);
        break;
      case "localMessage":
        this.handleLocalMessage(ws, clientId, parsed);
        break;
      case "declarealert":
        this.handleDeclareAlert(ws, clientId);
        break;
      case "leave":
        await this.handleLeave(ws, clientId);
        break;
      default:
        this.send(ws, { event: "error", message: `Unknown event: ${String(event)}` });
    }
  }
  async webSocketClose(_ws, _code, _reason) {
  }
  async webSocketError(_ws, _error) {
  }
  // ─── Helpers ──────────────────────────────────────────────────────────────
  send(ws, message) {
    ws.send(JSON.stringify(message));
  }
  sendToClient(clientId, message) {
    for (const ws of this.ctx.getWebSockets(clientId)) {
      ws.send(JSON.stringify(message));
    }
  }
  /** Broadcast a message to all connected players (not spectators). */
  broadcastToPlayers(message) {
    for (const cookie of this.playerCookies) {
      if (cookie)
        this.sendToClient(cookie, message);
    }
  }
  /** Broadcast a message to every WebSocket in this Durable Object (players + spectators). */
  broadcastToAll(message) {
    for (const ws of this.ctx.getWebSockets()) {
      ws.send(JSON.stringify(message));
    }
  }
  /** Push current game state to every player and spectator. */
  broadcastGameState() {
    if (!this.game)
      return;
    for (let i = 0; i < NUM_PLAYERS; i++) {
      const cookie = this.playerCookies[i];
      if (!cookie)
        continue;
      const msg = {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(i),
        player: i,
        names: this.names
      };
      this.sendToClient(cookie, msg);
    }
    for (const [specCookie, watchingPlayer] of this.spectators) {
      const msg = {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(watchingPlayer),
        player: watchingPlayer,
        names: this.names
      };
      this.sendToClient(specCookie, msg);
    }
  }
  getPlayerForCookie(clientId) {
    const idx = this.playerCookies.indexOf(clientId);
    return idx >= 0 ? idx : null;
  }
  removeClientFromGame(clientId) {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum !== null) {
      this.playerCookies[playerNum] = null;
      return true;
    }
    if (this.spectators.delete(clientId))
      return true;
    return false;
  }
  // ─── Event Handlers ───────────────────────────────────────────────────────
  async handleJoin(ws, clientId, data) {
    if (!this.game) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }
    const playerNum = Number(data.player);
    if (isNaN(playerNum) || playerNum < 0 || playerNum >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }
    if (this.playerCookies.includes(clientId)) {
      this.send(ws, { event: "joinstatus", success: false, reason: "you already joined" });
      return;
    }
    if (this.playerCookies[playerNum] !== null) {
      this.send(ws, { event: "joinstatus", success: false, reason: "someone else already joined" });
      return;
    }
    const currentCount = this.playerCookies.filter((c) => c !== null).length;
    if (currentCount >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "already 6 players" });
      return;
    }
    let playerName = String(data.name ?? "").trim();
    if (!playerName || playerName === `Player ${playerNum + 1}`) {
      playerName = `Playah #${playerNum + 1}`;
    }
    for (let i = 0; i < NUM_PLAYERS; i++) {
      if (i !== playerNum && this.names[i] === playerName) {
        this.send(ws, { event: "joinstatus", success: false, reason: "duplicate name" });
        return;
      }
    }
    this.spectators.delete(clientId);
    this.playerCookies[playerNum] = clientId;
    this.names[playerNum] = playerName;
    await this.saveToStorage();
    this.send(ws, { event: "joinstatus", success: true });
    this.broadcastToPlayers({ event: "refresh" });
  }
  async handleWatch(ws, clientId, data) {
    if (!this.game) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }
    const playerNum = Number(data.player);
    if (isNaN(playerNum) || playerNum < 0 || playerNum >= NUM_PLAYERS) {
      this.send(ws, { event: "joinstatus", success: false, reason: "invalid" });
      return;
    }
    if (this.playerCookies[playerNum] === null) {
      this.send(ws, { event: "joinstatus", success: false, reason: "player hasnt joined yet" });
      return;
    }
    this.removeClientFromGame(clientId);
    this.spectators.set(clientId, playerNum);
    this.send(ws, { event: "joinstatus", success: true });
    this.send(ws, {
      event: "gamestate",
      gameCode: this.gameCode,
      data: this.game.getData(playerNum),
      player: playerNum,
      names: this.names
    });
    const watchedCookie = this.playerCookies[playerNum];
    const spectatorName = String(data.name ?? "").trim() || void 0;
    this.sendToClient(watchedCookie, {
      event: "spectatorjoinedgame",
      name: spectatorName
    });
  }
  async handleMakeMove(ws, clientId, data) {
    if (!this.game) {
      this.send(ws, { event: "makemovestatus", success: false });
      return;
    }
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null) {
      this.send(ws, { event: "makemovestatus", success: false });
      return;
    }
    this.game.update(playerNum, data.data);
    await this.saveToStorage();
    this.send(ws, { event: "makemovestatus", success: true });
    this.broadcastGameState();
  }
  handleGameStateRequest(ws, clientId) {
    if (!this.game)
      return;
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum !== null) {
      this.send(ws, {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(playerNum),
        player: playerNum,
        names: this.names
      });
      return;
    }
    const watchingPlayer = this.spectators.get(clientId);
    if (watchingPlayer !== void 0) {
      this.send(ws, {
        event: "gamestate",
        gameCode: this.gameCode,
        data: this.game.getData(watchingPlayer),
        player: watchingPlayer,
        names: this.names
      });
    }
  }
  handleLocalMessage(_ws, clientId, data) {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null)
      return;
    const message = String(data.message ?? "");
    const name = this.names[playerNum];
    this.broadcastToAll({ event: "localmessage", user: name, message });
  }
  handleDeclareAlert(_ws, clientId) {
    const playerNum = this.getPlayerForCookie(clientId);
    if (playerNum === null)
      return;
    const name = this.names[playerNum];
    this.broadcastToAll({ event: "declarealert", name });
  }
  async handleLeave(ws, clientId) {
    const removed = this.removeClientFromGame(clientId);
    if (removed) {
      await this.saveToStorage();
      this.send(ws, { event: "leavestatus", success: true, reason: "left game" });
    } else {
      this.send(ws, { event: "leavestatus", success: true, reason: "nothing to leave" });
    }
  }
};
__name(GameRoom, "GameRoom");

// src/index.ts
function randomString(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
__name(randomString, "randomString");
function getLocationHint(request) {
  const map = {
    AF: "afr",
    AS: "apac",
    EU: "weur",
    NA: "wnam",
    OC: "oc",
    SA: "sam"
  };
  return map[request.cf?.continent] ?? void 0;
}
__name(getLocationHint, "getLocationHint");
function parseCookies2(cookieHeader) {
  if (!cookieHeader)
    return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const eqIdx = c.indexOf("=");
      if (eqIdx === -1)
        return [c.trim(), ""];
      return [c.slice(0, eqIdx).trim(), c.slice(eqIdx + 1).trim()];
    })
  );
}
__name(parseCookies2, "parseCookies");
async function handleCreate(request, env2) {
  const contentType = request.headers.get("Content-Type") ?? "";
  let captchaToken = null;
  if (contentType.includes("application/json")) {
    const body = await request.json();
    captchaToken = body["g-recaptcha-response"] ?? null;
  } else {
    const formData = await request.formData();
    captchaToken = formData.get("g-recaptcha-response");
  }
  if (env2.DISABLE_CAPTCHA !== "true") {
    if (!captchaToken) {
      return Response.json({ pass: false, reason: "no recaptcha" });
    }
    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${env2.RECAPTCHA_SECRET}&response=${captchaToken}&remoteip=${ip}`;
    let captchaOk = false;
    try {
      const verifyResponse = await fetch(verifyUrl);
      const verifyData = await verifyResponse.json();
      captchaOk = verifyData.success === true;
    } catch {
      return Response.json({ pass: false, reason: "recaptcha verification failed" });
    }
    if (!captchaOk) {
      return Response.json({ pass: false, reason: "recaptcha failed" });
    }
  }
  const gameId = randomString(GAME_CODE_LENGTH);
  const id = env2.GAME_ROOM.idFromName(gameId);
  const hint = getLocationHint(request);
  const room = env2.GAME_ROOM.get(id, hint ? { locationHint: hint } : void 0);
  const createResponse = await room.fetch(
    new Request(`https://internal/create?gameId=${gameId}`, { method: "GET" })
  );
  if (!createResponse.ok) {
    return Response.json({ pass: false, reason: "failed to create game" });
  }
  return Response.json({ pass: true, code: gameId });
}
__name(handleCreate, "handleCreate");
async function handleWebSocket(request, env2) {
  const url = new URL(request.url);
  const gameCode = url.searchParams.get("game");
  if (!gameCode) {
    return new Response("Missing game code", { status: 400 });
  }
  const cookies = parseCookies2(request.headers.get("Cookie"));
  if (!cookies[COOKIE_NAME]) {
    return new Response("Missing client ID cookie", { status: 400 });
  }
  const id = env2.GAME_ROOM.idFromName(gameCode);
  const hint = getLocationHint(request);
  const room = env2.GAME_ROOM.get(id, hint ? { locationHint: hint } : void 0);
  return room.fetch(
    new Request(`https://internal/ws`, {
      headers: request.headers
    })
  );
}
__name(handleWebSocket, "handleWebSocket");
var src_default = {
  async fetch(request, env2, _ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/create" && request.method === "POST") {
      return handleCreate(request, env2);
    }
    if (url.pathname === "/ws") {
      return handleWebSocket(request, env2);
    }
    return new Response("Not Found", { status: 404 });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-LampWi/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-LampWi/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  GameRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
