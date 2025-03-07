// node_modules/solid-js/dist/dev.js
var sharedConfig = {
  context: undefined,
  registry: undefined,
  effects: undefined,
  done: false,
  getContextId() {
    return getContextId(this.context.count);
  },
  getNextContextId() {
    return getContextId(this.context.count++);
  }
};
function getContextId(count) {
  const num = String(count), len = num.length - 1;
  return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
var IS_DEV = true;
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var signalOptions = {
  equals: equalFn
};
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
var DevHooks = {
  afterUpdate: null,
  afterCreateOwner: null,
  afterCreateSignal: null,
  afterRegisterGraph: null
};
function createRoot(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === undefined ? owner : detachedOwner, root = unowned ? {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  } : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? () => fn(() => {
    throw new Error("Dispose method must be an explicit argument to createRoot function");
  }) : () => fn(() => untrack(() => cleanNode(root)));
  DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(root);
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  {
    if (options.name)
      s.name = options.name;
    if (options.internal) {
      s.internal = true;
    } else {
      registerGraph(s);
      if (DevHooks.afterCreateSignal)
        DevHooks.afterCreateSignal(s);
    }
  }
  const setter = (value2) => {
    if (typeof value2 === "function") {
      if (Transition && Transition.running && Transition.sources.has(s))
        value2 = value2(s.tValue);
      else
        value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE, options);
  if (Scheduler && Transition && Transition.running)
    Updates.push(c);
  else
    updateComputation(c);
}
function untrack(fn) {
  if (!ExternalSourceConfig && Listener === null)
    return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig)
      return ExternalSourceConfig.untrack(fn);
    return fn();
  } finally {
    Listener = listener;
  }
}
function onCleanup(fn) {
  if (Owner === null)
    console.warn("cleanups created outside a `createRoot` or `render` will never be run");
  else if (Owner.cleanups === null)
    Owner.cleanups = [fn];
  else
    Owner.cleanups.push(fn);
  return fn;
}
function startTransition(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }
  const l = Listener;
  const o = Owner;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner = o;
    let t;
    if (Scheduler || SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set,
        effects: [],
        promises: new Set,
        disposed: new Set,
        queue: new Set,
        running: true
      });
      t.done || (t.done = new Promise((res) => t.resolve = res));
      t.running = true;
    }
    runUpdates(fn, false);
    Listener = Owner = null;
    return t ? t.done : undefined;
  });
}
var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
function registerGraph(value) {
  if (Owner) {
    if (Owner.sourceMap)
      Owner.sourceMap.push(value);
    else
      Owner.sourceMap = [value];
    value.graph = Owner;
  }
  if (DevHooks.afterRegisterGraph)
    DevHooks.afterRegisterGraph(value);
}
var SuspenseContext;
function readSignal() {
  const runningTransition = Transition && Transition.running;
  if (this.sources && (runningTransition ? this.tState : this.state)) {
    if ((runningTransition ? this.tState : this.state) === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  if (runningTransition && Transition.sources.has(this))
    return this.tValue;
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    if (Transition) {
      const TransitionRunning = Transition.running;
      if (TransitionRunning || !isComp && Transition.sources.has(node)) {
        Transition.sources.add(node);
        node.tValue = value;
      }
      if (!TransitionRunning)
        node.value = value;
    } else
      node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0;i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o))
            continue;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure)
              Updates.push(o);
            else
              Effects.push(o);
            if (o.observers)
              markDownstream(o);
          }
          if (!TransitionRunning)
            o.state = STALE;
          else
            o.tState = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (IS_DEV)
            throw new Error("Potential Infinite Loop Detected.");
          throw new Error;
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn)
    return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        Listener = Owner = node;
        runComputation(node, node.tValue, time);
        Listener = Owner = null;
      }, false);
    });
  }
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner, listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      if (Transition && Transition.running) {
        node.tState = STALE;
        node.tOwned && node.tOwned.forEach(cleanNode);
        node.tOwned = undefined;
      } else {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else
      node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }
  if (Owner === null)
    console.warn("computations created outside a `createRoot` or `render` will never be disposed");
  else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned)
        Owner.tOwned = [c];
      else
        Owner.tOwned.push(c);
    } else {
      if (!Owner.owned)
        Owner.owned = [c];
      else
        Owner.owned.push(c);
    }
  }
  if (options && options.name)
    c.name = options.name;
  if (ExternalSourceConfig && c.fn) {
    const [track, trigger] = createSignal(undefined, {
      equals: false
    });
    const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
    onCleanup(() => ordinary.dispose());
    const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
    const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
    c.fn = (x) => {
      track();
      return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
    };
  }
  DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(c);
  return c;
}
function runTop(node) {
  const runningTransition = Transition && Transition.running;
  if ((runningTransition ? node.tState : node.state) === 0)
    return;
  if ((runningTransition ? node.tState : node.state) === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node))
      return;
    if (runningTransition ? node.tState : node.state)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1;i >= 0; i--) {
    node = ancestors[i];
    if (runningTransition) {
      let top = node, prev = ancestors[i + 1];
      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top))
          return;
      }
    }
    if ((runningTransition ? node.tState : node.state) === STALE) {
      updateComputation(node);
    } else if ((runningTransition ? node.tState : node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates)
    return fn();
  let wait = false;
  if (!init)
    Updates = [];
  if (Effects)
    wait = true;
  else
    Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait)
      Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    if (Scheduler && Transition && Transition.running)
      scheduleQueue(Updates);
    else
      runQueue(Updates);
    Updates = null;
  }
  if (wait)
    return;
  let res;
  if (Transition) {
    if (!Transition.promises.size && !Transition.queue.size) {
      const sources = Transition.sources;
      const disposed = Transition.disposed;
      Effects.push.apply(Effects, Transition.effects);
      res = Transition.resolve;
      for (const e2 of Effects) {
        "tState" in e2 && (e2.state = e2.tState);
        delete e2.tState;
      }
      Transition = null;
      runUpdates(() => {
        for (const d of disposed)
          cleanNode(d);
        for (const v of sources) {
          v.value = v.tValue;
          if (v.owned) {
            for (let i = 0, len = v.owned.length;i < len; i++)
              cleanNode(v.owned[i]);
          }
          if (v.tOwned)
            v.owned = v.tOwned;
          delete v.tValue;
          delete v.tOwned;
          v.tState = 0;
        }
        setTransPending(false);
      }, false);
    } else if (Transition.running) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }
  }
  const e = Effects;
  Effects = null;
  if (e.length)
    runUpdates(() => runEffects(e), false);
  else
    DevHooks.afterUpdate && DevHooks.afterUpdate();
  if (res)
    res();
}
function runQueue(queue) {
  for (let i = 0;i < queue.length; i++)
    runTop(queue[i]);
}
function scheduleQueue(queue) {
  for (let i = 0;i < queue.length; i++) {
    const item = queue[i];
    const tasks = Transition.queue;
    if (!tasks.has(item)) {
      tasks.add(item);
      Scheduler(() => {
        tasks.delete(item);
        runUpdates(() => {
          Transition.running = true;
          runTop(item);
        }, false);
        Transition && (Transition.running = false);
      });
    }
  }
}
function lookUpstream(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition)
    node.tState = 0;
  else
    node.state = 0;
  for (let i = 0;i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = runningTransition ? source.tState : source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING)
        lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  const runningTransition = Transition && Transition.running;
  for (let i = 0;i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (runningTransition ? !o.tState : !o.state) {
      if (runningTransition)
        o.tState = PENDING;
      else
        o.state = PENDING;
      if (o.pure)
        Updates.push(o);
      else
        Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.tOwned) {
    for (i = node.tOwned.length - 1;i >= 0; i--)
      cleanNode(node.tOwned[i]);
    delete node.tOwned;
  }
  if (Transition && Transition.running && node.pure) {
    reset(node, true);
  } else if (node.owned) {
    for (i = node.owned.length - 1;i >= 0; i--)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1;i >= 0; i--)
      node.cleanups[i]();
    node.cleanups = null;
  }
  if (Transition && Transition.running)
    node.tState = 0;
  else
    node.state = 0;
  delete node.sourceMap;
}
function reset(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }
  if (node.owned) {
    for (let i = 0;i < node.owned.length; i++)
      reset(node.owned[i]);
  }
}
function castError(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function runErrors(err, fns, owner) {
  try {
    for (const f of fns)
      f(err);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
}
function handleError(err, owner = Owner) {
  const fns = ERROR && owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns)
    throw error;
  if (Effects)
    Effects.push({
      fn() {
        runErrors(error, fns, owner);
      },
      state: STALE
    });
  else
    runErrors(error, fns, owner);
}
var FALLBACK = Symbol("fallback");
if (globalThis) {
  if (!globalThis.Solid$$)
    globalThis.Solid$$ = true;
  else
    console.warn("You appear to have multiple instances of Solid. This can lead to unexpected behavior.");
}

// node_modules/solid-js/web/dist/dev.js
var booleans = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected"
];
var Properties = /* @__PURE__ */ new Set([
  "className",
  "value",
  "readOnly",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...booleans
]);
var Aliases = /* @__PURE__ */ Object.assign(Object.create(null), {
  className: "class",
  htmlFor: "for"
});
var PropAliases = /* @__PURE__ */ Object.assign(Object.create(null), {
  class: "className",
  formnovalidate: {
    $: "formNoValidate",
    BUTTON: 1,
    INPUT: 1
  },
  ismap: {
    $: "isMap",
    IMG: 1
  },
  nomodule: {
    $: "noModule",
    SCRIPT: 1
  },
  playsinline: {
    $: "playsInline",
    VIDEO: 1
  },
  readonly: {
    $: "readOnly",
    INPUT: 1,
    TEXTAREA: 1
  }
});
function reconcileArrays(parentNode, a, b) {
  let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd)
        parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]))
          a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map;
        let i = bStart;
        while (i < bEnd)
          map.set(b[i], i++);
      }
      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart, sequence = 1, t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence)
              break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index)
              parentNode.insertBefore(b[bStart++], node);
          } else
            parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else
          aStart++;
      } else
        a[aStart++].remove();
    }
  }
}
function render(code, element, init, options = {}) {
  if (!element) {
    throw new Error("The `element` passed to `render(..., element)` doesn't exist. Make sure `element` exists in the document.");
  }
  let disposer;
  createRoot((dispose) => {
    disposer = dispose;
    element === document ? code() : insert(element, code(), element.firstChild ? null : undefined, init);
  }, options.owner);
  return () => {
    disposer();
    element.textContent = "";
  };
}
function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial)
    initial = [];
  if (typeof accessor !== "function")
    return insertExpression(parent, accessor, initial, marker);
  createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
}
function isHydrating(node) {
  return !!sharedConfig.context && !sharedConfig.done && (!node || node.isConnected);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  const hydrating = isHydrating(parent);
  if (hydrating) {
    !current && (current = [...parent.childNodes]);
    let cleaned = [];
    for (let i = 0;i < current.length; i++) {
      const node = current[i];
      if (node.nodeType === 8 && node.data.slice(0, 2) === "!$")
        node.remove();
      else
        cleaned.push(node);
    }
    current = cleaned;
  }
  while (typeof current === "function")
    current = current();
  if (value === current)
    return current;
  const t = typeof value, multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (hydrating)
      return current;
    if (t === "number") {
      value = value.toString();
      if (value === current)
        return current;
    }
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data !== value && (node.data = value);
      } else
        node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else
        current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    if (hydrating)
      return current;
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createRenderEffect(() => {
      let v = value();
      while (typeof v === "function")
        v = v();
      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }
    if (hydrating) {
      if (!array.length)
        return current;
      if (marker === undefined)
        return current = [...parent.childNodes];
      let node = array[0];
      if (node.parentNode !== parent)
        return current;
      const nodes = [node];
      while ((node = node.nextSibling) !== marker)
        nodes.push(node);
      return current = nodes;
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi)
        return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else
        reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (hydrating && value.parentNode)
      return current = multi ? [value] : value;
    if (Array.isArray(current)) {
      if (multi)
        return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else
      parent.replaceChild(value, parent.firstChild);
    current = value;
  } else
    console.warn(`Unrecognized value. Skipped inserting`, value);
  return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length;i < len; i++) {
    let item = array[i], prev = current && current[normalized.length], t;
    if (item == null || item === true || item === false)
      ;
    else if ((t = typeof item) === "object" && item.nodeType) {
      normalized.push(item);
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
    } else if (t === "function") {
      if (unwrap) {
        while (typeof item === "function")
          item = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      const value = String(item);
      if (prev && prev.nodeType === 3 && prev.data === value)
        normalized.push(prev);
      else
        normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}
function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length;i < len; i++)
    parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined)
    return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1;i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i)
          isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
        else
          isParent && el.remove();
      } else
        inserted = true;
    }
  } else
    parent.insertBefore(node, marker);
  return [node];
}
var RequestContext = Symbol();

// src/services/resumeService.ts
var sectionConfig = {
  about: true,
  experience: true,
  skills: true,
  education: true,
  projects: false,
  certifications: true,
  volunteering: true
};
var sampleResumeData = {
  basics: {
    name: "Caleb Hopkins",
    label: "Senior Software Engineer",
    email: "chhhopkins@gmail.com",
    phone: "+16082078940",
    summary: "Results-driven Data Engineering professional with extensive experience in ETL pipeline implementation and data warehouse architecture. Demonstrated expertise in abstracting and aggregating source data for analytics and reporting purposes. Known for delivering maintainable software solutions while prioritizing development efficiency. Track record of successfully leading cross-functional teams in implementing enterprise-scale data solutions using modern technologies including dbt, Snowflake, BigQuery, and AWS.",
    location: {
      city: "Chicago",
      region: "IL",
      countryCode: "US"
    },
    profiles: [
      {
        network: "LinkedIn",
        username: "c-hopkins3",
        url: "https://www.linkedin.com/in/c-hopkins3",
        icon: "linkedin"
      }
    ]
  },
  work: [
    {
      company: "Method, a Hitachi Subsidiary",
      position: "Senior Software Engineer",
      website: "",
      startDate: "2022-12",
      endDate: "Present",
      summary: "",
      highlights: [
        "Pitched, Created, Designed, and Implemented Resource Augmented Generation (RAG) AI application to correct and reconcile disparate revisions of resource planning documents for Method's sales and project management teams reducing incidence of double-booked resources by >95%",
        "Designed and implemented Method's comprehensive data warehousing and ecosystem, ensuring robust data management and accessibility",
        "Created a clinical trial outreach data warehousing solution by unifying legacy and current data into a cohesive, extensible model",
        "Led the design and development of a modular, omni-channel digital marketing warehouse utilizing dbt, Fivetran, and Snowflake technologies",
        "Conducted technical screenings for new applicants across various software engineering disciplines, enhancing recruitment effectiveness",
        "Trained interns on technical systems, processes, and company culture, successfully converting multiple interns to full-time positions"
      ]
    },
    {
      company: "American Family Insurance",
      position: "Senior Data Engineer",
      website: "",
      startDate: "2022-01",
      endDate: "2022-12",
      summary: "",
      highlights: [
        "Spearheaded implementation of commercial umbrella claims data warehouse, streamlining data management and reporting capabilities",
        "Optimized high-fault data pipelines from acquired startup through strategic refactoring using dbt and BigQuery technologies",
        "Architected and executed migration to AWS native orchestration solution, reducing maintenance overhead and improving system efficiency",
        "Engineered real-time analytics framework utilizing Python, Spark, and Kafka, achieving a 50% increase in processing speed for insurance claims data"
      ]
    },
    {
      company: "Cognizant",
      position: "Data Engineer",
      website: "",
      startDate: "2021-01",
      endDate: "2021-12",
      summary: "",
      highlights: [
        "Engineered data pipelines to process and analyze over 500 TB of data monthly, enhancing data accessibility and reducing retrieval times by 30% through the use of Hadoop, Spark, and Python scripting",
        "Developed data pipeline test strategy for streaming data, reducing the frequency of data related breaking errors in downstream systems by 90%",
        "Coordinated onboarding of 5 data engineering resources across multiple global geographies to deliver client's new system"
      ]
    },
    {
      company: "Mu Sigma Data Solutions",
      position: "Data Engineer",
      website: "",
      startDate: "2019-06",
      endDate: "2020-11",
      summary: "",
      highlights: [
        "Developed end-to-end data pipelines that decreased data processing time by 50% using tools such as Apache Spark and Hadoop, supporting enhanced business insights for analysis and decision-making",
        "Engineered real-time data ingestion frameworks utilizing Apache Kafka, resulting in a 30% increase in data throughput and facilitating swift analytics capabilities for diverse data sources"
      ]
    }
  ],
  education: [
    {
      institution: "University of Wisconsin-Madison",
      area: "Economics",
      studyType: "Bachelor of Arts",
      startDate: "2015-09",
      endDate: "2018-12",
      gpa: "",
      courses: ["Minor in Development Economics and Econometrics"]
    },
    {
      institution: "MITx",
      area: "Statistics and Data Science",
      studyType: "MicroMasters",
      startDate: "2020",
      endDate: "2020",
      gpa: "",
      courses: []
    }
  ],
  skills: [
    {
      name: "Programming Languages",
      level: "Advanced",
      keywords: ["Python", "Java", "Scala", "Rust", "C", "SQL", "TypeScript", "JavaScript", "UML", "HTML", "MD"]
    },
    {
      name: "Data Engineering",
      level: "Advanced",
      keywords: ["dbt", "Airflow", "Prefect", "BigQuery", "Snowflake", "Databricks", "Azure Data Factory"]
    },
    {
      name: "Software Engineering",
      level: "Advanced",
      keywords: ["Object Oriented Design (OOD)", "Distributed Systems", "Domain Modeling", "Software System Design", "Database Design", "Data Structures", "Algorithms"]
    },
    {
      name: "DevOps & Infrastructure",
      level: "Advanced",
      keywords: ["Docker", "Kubernetes", "Terraform", "Cloud-Specific Infrastructure as Code", "Git", "CI/CD", "Test Design"]
    },
    {
      name: "Soft Skills",
      level: "Advanced",
      keywords: ["Sales Support", "Cross-Functional Work", "Requirements Gathering", "Development Planning", "Agile Development"]
    }
  ],
  certifications: [
    {
      name: "AWS Data Engineer",
      date: "2024",
      issuer: "Amazon Web Services",
      url: ""
    },
    {
      name: "AWS Solutions Architect Professional",
      date: "2024",
      issuer: "Amazon Web Services",
      url: ""
    },
    {
      name: "GCP Data Engineer",
      date: "2023",
      issuer: "Google Cloud",
      url: ""
    },
    {
      name: "AWS DevOps Professional",
      date: "2023",
      issuer: "Amazon Web Services",
      url: ""
    }
  ],
  projects: [],
  volunteering: [
    {
      organization: "Greater Chicago Food Depository",
      position: "Distribution Volunteer",
      startDate: "2022",
      endDate: "Present",
      summary: "I volunteer sporadically with the GCFD, packaging and distributing food donations to eligible recipients.",
      highlights: []
    },
    {
      organization: "AIESEC",
      position: "VP of Outgoing Global Volunteers",
      startDate: "2018",
      endDate: "2019",
      summary: "Coordinated UW-Madison's chapter of AIESEC USA, an organization that creates international volunteering and internship opportunities for young people - aligning each goal with one or more of the UN's Sustainable Development Goals",
      highlights: []
    }
  ]
};
var createResumeService = () => {
  const [resumeData, setResumeData] = createSignal(sampleResumeData);
  const updateResumeData = (newData) => {
    setResumeData((prev) => ({ ...prev, ...newData }));
  };
  return {
    resumeData,
    updateResumeData
  };
};
var resumeService = createResumeService();

// src/components/TableOfContents.tsx
var TableOfContents = (props) => {
  const [activeSection, setActiveSection] = createSignal();
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };
  return /* @__PURE__ */ React.createElement("nav", {
    class: "toc"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "toc-title"
  }, "Contents"), /* @__PURE__ */ React.createElement("ul", {
    class: "toc-list"
  }, props.sections.map((section) => /* @__PURE__ */ React.createElement("li", {
    class: "toc-item"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => scrollToSection(section.id),
    class: `toc-link ${activeSection() === section.id ? "active" : ""}`
  }, section.title)))));
};
var TableOfContents_default = TableOfContents;

// src/pages/Home.tsx
var Home = () => {
  const { resumeData } = resumeService;
  const basics = resumeData().basics;
  const work = resumeData().work || [];
  const education = resumeData().education || [];
  const skills = resumeData().skills || [];
  const projects = resumeData().projects || [];
  const certifications = resumeData().certifications || [];
  const volunteering = resumeData().volunteering || [];
  const sections = [
    ...sectionConfig.about ? [{ id: "about", title: "About" }] : [],
    ...sectionConfig.experience ? [{ id: "experience", title: "Experience" }] : [],
    ...sectionConfig.skills ? [{ id: "skills", title: "Skills" }] : [],
    ...sectionConfig.education ? [{ id: "education", title: "Education" }] : [],
    ...sectionConfig.projects ? [{ id: "projects", title: "Projects" }] : [],
    ...sectionConfig.certifications && certifications.length > 0 ? [{ id: "certifications", title: "Certifications" }] : [],
    ...sectionConfig.volunteering && volunteering.length > 0 ? [{ id: "volunteering", title: "Volunteering" }] : []
  ];
  return /* @__PURE__ */ React.createElement("div", {
    class: "resume-container"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-layout"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-sidebar"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "toc-container"
  }, /* @__PURE__ */ React.createElement(TableOfContents_default, {
    sections
  }))), /* @__PURE__ */ React.createElement("div", {
    class: "resume-content"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-wrapper"
  }, sectionConfig.about && /* @__PURE__ */ React.createElement("header", {
    id: "about",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h1", {
    class: "resume-name"
  }, basics.name), /* @__PURE__ */ React.createElement("h2", {
    class: "resume-title"
  }, basics.label), /* @__PURE__ */ React.createElement("div", {
    class: "contact-info"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "contact-item"
  }, /* @__PURE__ */ React.createElement("span", {
    class: "contact-label"
  }, "Email:"), " ", basics.email), basics.phone && /* @__PURE__ */ React.createElement("div", {
    class: "contact-item"
  }, /* @__PURE__ */ React.createElement("span", {
    class: "contact-label"
  }, "Phone:"), " ", basics.phone), basics.location && /* @__PURE__ */ React.createElement("div", {
    class: "contact-item"
  }, /* @__PURE__ */ React.createElement("span", {
    class: "contact-label"
  }, "Location:"), " ", basics.location?.city, basics.location?.region && `, ${basics.location?.region}`)), /* @__PURE__ */ React.createElement("div", {
    class: "profile-links"
  }, basics.profiles.map((profile) => /* @__PURE__ */ React.createElement("a", {
    href: profile.url,
    target: "_blank",
    rel: "noopener noreferrer",
    class: "profile-link"
  }, profile.network))), /* @__PURE__ */ React.createElement("p", {
    class: "summary"
  }, basics.summary)), sectionConfig.experience && /* @__PURE__ */ React.createElement("section", {
    id: "experience",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Work Experience"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, work.map((job) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-header"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, job.position), /* @__PURE__ */ React.createElement("span", {
    class: "item-date"
  }, job.startDate, " - ", job.endDate || "Present")), /* @__PURE__ */ React.createElement("div", {
    class: "company-name"
  }, job.company), /* @__PURE__ */ React.createElement("p", {
    class: "item-summary"
  }, job.summary), /* @__PURE__ */ React.createElement("ul", {
    class: "item-bullets"
  }, job.highlights.map((highlight) => /* @__PURE__ */ React.createElement("li", null, highlight))))))), sectionConfig.skills && /* @__PURE__ */ React.createElement("section", {
    id: "skills",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Skills"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, skills.map((skill) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, skill.name), /* @__PURE__ */ React.createElement("div", {
    class: "skill-tags"
  }, skill.keywords.map((keyword) => /* @__PURE__ */ React.createElement("span", {
    class: "skill-tag"
  }, keyword))))))), sectionConfig.education && /* @__PURE__ */ React.createElement("section", {
    id: "education",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Education"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, education.map((edu) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-header"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, edu.institution), /* @__PURE__ */ React.createElement("span", {
    class: "item-date"
  }, edu.startDate, " - ", edu.endDate || "Present")), /* @__PURE__ */ React.createElement("div", {
    class: "degree-info"
  }, edu.studyType, " in ", edu.area), edu.gpa && /* @__PURE__ */ React.createElement("div", {
    class: "gpa"
  }, "GPA: ", edu.gpa), edu.courses && /* @__PURE__ */ React.createElement("div", {
    class: "courses-container"
  }, /* @__PURE__ */ React.createElement("h4", {
    class: "courses-title"
  }, "Relevant Courses:"), /* @__PURE__ */ React.createElement("div", {
    class: "skill-tags"
  }, edu.courses.map((course) => /* @__PURE__ */ React.createElement("span", {
    class: "skill-tag"
  }, course)))))))), sectionConfig.projects && /* @__PURE__ */ React.createElement("section", {
    id: "projects",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Projects"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, projects.map((project) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-header"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, project.name), /* @__PURE__ */ React.createElement("div", {
    class: "project-links"
  }, project.url && /* @__PURE__ */ React.createElement("a", {
    href: project.url,
    target: "_blank",
    rel: "noopener noreferrer",
    class: "project-link"
  }, "Live Demo"), project.github && /* @__PURE__ */ React.createElement("a", {
    href: project.github,
    target: "_blank",
    rel: "noopener noreferrer",
    class: "project-link"
  }, "GitHub"))), /* @__PURE__ */ React.createElement("p", {
    class: "item-summary"
  }, project.description), /* @__PURE__ */ React.createElement("ul", {
    class: "item-bullets"
  }, project.highlights.map((highlight) => /* @__PURE__ */ React.createElement("li", null, highlight))), /* @__PURE__ */ React.createElement("div", {
    class: "skill-tags"
  }, project.keywords.map((keyword) => /* @__PURE__ */ React.createElement("span", {
    class: "skill-tag"
  }, keyword))))))), sectionConfig.certifications && certifications.length > 0 && /* @__PURE__ */ React.createElement("section", {
    id: "certifications",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Certifications"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, certifications.map((cert) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, cert.name), /* @__PURE__ */ React.createElement("div", {
    class: "cert-info"
  }, cert.issuer, " • ", /* @__PURE__ */ React.createElement("span", {
    class: "item-date"
  }, cert.date), cert.url && /* @__PURE__ */ React.createElement("span", null, " • ", /* @__PURE__ */ React.createElement("a", {
    href: cert.url,
    target: "_blank",
    rel: "noopener noreferrer",
    class: "project-link"
  }, "View Certificate"))))))), sectionConfig.volunteering && volunteering.length > 0 && /* @__PURE__ */ React.createElement("section", {
    id: "volunteering",
    class: "resume-card"
  }, /* @__PURE__ */ React.createElement("h2", {
    class: "section-title"
  }, "Volunteering"), /* @__PURE__ */ React.createElement("div", {
    class: "resume-items"
  }, volunteering.map((vol) => /* @__PURE__ */ React.createElement("div", {
    class: "resume-item"
  }, /* @__PURE__ */ React.createElement("div", {
    class: "resume-header"
  }, /* @__PURE__ */ React.createElement("h3", {
    class: "item-title"
  }, vol.position), /* @__PURE__ */ React.createElement("span", {
    class: "item-date"
  }, vol.startDate, " - ", vol.endDate || "Present")), /* @__PURE__ */ React.createElement("div", {
    class: "company-name"
  }, vol.organization), /* @__PURE__ */ React.createElement("p", {
    class: "item-summary"
  }, vol.summary), vol.highlights.length > 0 && /* @__PURE__ */ React.createElement("ul", {
    class: "item-bullets"
  }, vol.highlights.map((highlight) => /* @__PURE__ */ React.createElement("li", null, highlight)))))))))));
};
var Home_default = Home;

// src/App.tsx
var App = () => {
  return /* @__PURE__ */ React.createElement(Home_default, null);
};
var App_default = App;

// src/index.tsx
var root = document.getElementById("root");
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}
render(() => /* @__PURE__ */ React.createElement(App_default, null), root);
