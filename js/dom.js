function dom() {
  let observers = [],
    pendingMutations = false;

  class Node {
    constructor(nodeType, nodeName) {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.childNodes = [];
    }
    appendChild(child) {
      child.remove();
      child.parentNode = this;
      this.childNodes.push(child);
      if (this.children && child.nodeType === 1) this.children.push(child);
      mutation(this, "childList", {
        addedNodes: [child],
        previousSibling: this.childNodes[this.childNodes.length - 2],
      });
    }
    insertBefore(child, ref) {
      child.remove();
      let i = splice(this.childNodes, ref, child),
        ref2;
      if (!ref) {
        this.appendChild(child);
      } else {
        if (~i && child.nodeType === 1) {
          while (
            (i < this.childNodes.length &&
              (ref2 = this.childNodes[i]).nodeType !== 1) ||
            ref === child
          )
            i++;
          if (ref2) splice(this.children, ref, child);
        }
        mutation(this, "childList", { addedNodes: [child], nextSibling: ref });
      }
    }
    replaceChild(child, ref) {
      if (ref.parentNode === this) {
        this.insertBefore(child, ref);
        ref.remove();
      }
    }
    removeChild(child) {
      let i = splice(this.childNodes, child);
      if (child.nodeType === 1) splice(this.children, child);
      mutation(this, "childList", {
        removedNodes: [child],
        previousSibling: this.childNodes[i - 1],
        nextSibling: this.childNodes[i],
      });
    }
    remove() {
      if (this.parentNode) this.parentNode.removeChild(this);
    }
  }

  class Text extends Node {
    constructor(text) {
      super(3, "#text"); // TEXT_NODE
      // this.textContent = this.nodeValue = text;
      this.data = text;
    }
    get textContent() {
      return this.data;
    }
    set textContent(value) {
      let oldValue = this.data;
      this.data = value;
      mutation(this, "characterData", { oldValue });
    }
    get nodeValue() {
      return this.data;
    }
    set nodeValue(value) {
      this.textContent = value;
    }
  }

  class Element extends Node {
    constructor(nodeType, nodeName) {
      super(nodeType || 1, nodeName); // ELEMENT_NODE
      this.attributes = [];
      this.children = [];
      this.__handlers = {};
      this.style = {};
      Object.defineProperty(this, "className", {
        set: (val) => {
          this.setAttribute("class", val);
        },
        get: () => this.getAttribute("style"),
      });
      Object.defineProperty(this.style, "cssText", {
        set: (val) => {
          this.setAttribute("style", val);
        },
        get: () => this.getAttribute("style"),
      });
    }

    setAttribute(key, value) {
      this.setAttributeNS(null, key, value);
    }
    getAttribute(key) {
      return this.getAttributeNS(null, key);
    }
    removeAttribute(key) {
      this.removeAttributeNS(null, key);
    }

    setAttributeNS(ns, name, value) {
      let attr = findWhere(this.attributes, createAttributeFilter(ns, name)),
        oldValue = attr && attr.value;
      if (!attr) this.attributes.push((attr = { ns, name }));
      attr.value = String(value);
      mutation(this, "attributes", {
        attributeName: name,
        attributeNamespace: ns,
        oldValue,
      });
    }
    getAttributeNS(ns, name) {
      let attr = findWhere(this.attributes, createAttributeFilter(ns, name));
      return attr && attr.value;
    }
    removeAttributeNS(ns, name) {
      splice(this.attributes, createAttributeFilter(ns, name));
      mutation(this, "attributes", {
        attributeName: name,
        attributeNamespace: ns,
        oldValue: this.getAttributeNS(ns, name),
      });
    }

    addEventListener(type, handler) {
      (
        this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])
      ).push(handler);
    }
    removeEventListener(type, handler) {
      splice(this.__handlers[toLower(type)], handler, 0, true);
    }
    dispatchEvent(event) {
      let t = (event.currentTarget = this),
        c = event.cancelable,
        l,
        i;
      do {
        l = t.__handlers && t.__handlers[toLower(event.type)];
        if (l)
          for (i = l.length; i--; ) {
            if ((l[i].call(t, event) === false || event._end) && c) break;
          }
      } while (
        event.bubbles &&
        !(c && event._stop) &&
        (event.target = t = t.parentNode)
      );
      return !event.defaultPrevented;
    }
  }

  class SVGElement extends Element {}

  class Document extends Element {
    constructor() {
      super(9, "#document"); // DOCUMENT_NODE
    }
  }

  class Event {
    constructor(type, opts) {
      this.type = type;
      this.bubbles = !!opts.bubbles;
      this.cancelable = !!opts.cancelable;
    }
    stopPropagation() {
      this._stop = true;
    }
    stopImmediatePropagation() {
      this._end = this._stop = true;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
  }

  function mutation(target, type, record) {
    record.target = target;
    record.type = type;

    for (let i = observers.length; i--; ) {
      let ob = observers[i],
        match = target === ob._target;
      if (!match && ob._options.subtree) {
        do {
          if ((match = target === ob._target)) break;
        } while ((target = target.parentNode));
      }
      if (match) {
        ob._records.push(record);
        if (!pendingMutations) {
          pendingMutations = true;
          setImmediate(flushMutations);
        }
      }
    }
  }

  function flushMutations() {
    pendingMutations = false;
    for (let i = observers.length; i--; ) {
      let ob = observers[i];
      if (ob._records.length) {
        ob.callback(ob.takeRecords());
      }
    }
  }

  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this._records = [];
    }
    observe(target, options) {
      this.disconnect();
      this._target = target;
      this._options = options || {};
      observers.push(this);
    }
    disconnect() {
      this._target = null;
      splice(observers, this);
    }
    takeRecords() {
      return this._records.splice(0, this._records.length);
    }
  }

  function createElement(type) {
    return new Element(null, String(type).toUpperCase());
  }

  function createElementNS(ns, type) {
    let element = createElement(type);
    element.namespace = ns;
    return element;
  }

  function createTextNode(text) {
    return new Text(text);
  }

  function createDocument() {
    let document = new Document();
    assign(
      document,
      (document.defaultView = {
        document,
        MutationObserver,
        Document,
        Node,
        Text,
        Element,
        SVGElement,
        Event,
      })
    );
    assign(document, {
      documentElement: document,
      createElement,
      createElementNS,
      createTextNode,
    });
    document.appendChild((document.body = createElement("body")));
    return document;
  }

  return createDocument();
}

function assign(obj, props) {
  for (let i in props) obj[i] = props[i]; // eslint-disable-line guard-for-in
}

function toLower(str) {
  return String(str).toLowerCase();
}

function createAttributeFilter(ns, name) {
  return (o) => o.ns === ns && toLower(o.name) === toLower(name);
}

function splice(arr, item, add, byValueOnly) {
  let i = arr ? findWhere(arr, item, true, byValueOnly) : -1;
  if (~i) add ? arr.splice(i, 0, add) : arr.splice(i, 1);
  return i;
}

function findWhere(arr, fn, returnIndex, byValueOnly) {
  let i = arr.length;
  while (i--)
    if (typeof fn === "function" && !byValueOnly ? fn(arr[i]) : arr[i] === fn)
      break;
  return returnIndex ? i : arr[i];
}

const defaultObj = {};
const jointIter = (aProps, bProps, callback) => {
  aProps = aProps || defaultObj;
  bProps = bProps || defaultObj;
  Object.keys(aProps).forEach((k) => callback(k, aProps[k], bProps[k]));
  Object.keys(bProps).forEach(
    (k) => !aProps.hasOwnProperty(k) && callback(k, undefined, bProps[k])
  );
};
const updateElement = (dom, aProps, bProps) => {
  jointIter(aProps, bProps, (name, a, b) => {
    if (a === b || name === "children");
    else if (name === "style" && !isStr(b)) {
      jointIter(a, b, (styleKey, aStyle, bStyle) => {
        if (aStyle !== bStyle) {
          dom[name][styleKey] = bStyle || "";
        }
      });
    } else if (name[0] === "o" && name[1] === "n") {
      name = name.slice(2).toLowerCase();
      if (a) dom.removeEventListener(name, a);
      dom.addEventListener(name, b);
    } else if (name in dom && !(dom instanceof SVGElement)) {
      dom[name] = b || "";
    } else if (b == null || b === false) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, b);
    }
  });
};
const createElement = (fiber) => {
  const dom =
    fiber.type === "#text"
      ? document.createTextNode("")
      : fiber.lane & 16
      ? document.createElementNS("http://www.w3.org/2000/svg", fiber.type)
      : document.createElement(fiber.type);
  updateElement(dom, {}, fiber.props);
  return dom;
};

const EMPTY_ARR = [];
let cursor = 0;
const resetCursor = () => {
  cursor = 0;
};
const useState = (initState) => {
  return useReducer(null, initState);
};
const useReducer = (reducer, initState) => {
  const [hook, current] = getHook(cursor++);
  if (hook.length === 0) {
    hook[0] = initState;
    hook[1] = (value) => {
      hook[0] = reducer
        ? reducer(hook[0], value)
        : isFn(value)
        ? value(hook[0])
        : value;
      update(current);
    };
  }
  return hook;
};
const useEffect = (cb, deps) => {
  return effectImpl(cb, deps, "effect");
};
const useLayout = (cb, deps) => {
  return effectImpl(cb, deps, "layout");
};
const effectImpl = (cb, deps, key) => {
  const [hook, current] = getHook(cursor++);
  if (isChanged(hook[1], deps)) {
    hook[0] = cb;
    hook[1] = deps;
    current.hooks[key].push(hook);
  }
};
const useMemo = (cb, deps) => {
  const hook = getHook(cursor++)[0];
  if (isChanged(hook[1], deps)) {
    hook[1] = deps;
    return (hook[0] = cb());
  }
  return hook[0];
};
const useCallback = (cb, deps) => {
  return useMemo(() => cb, deps);
};
const useRef = (current) => {
  return useMemo(() => ({ current }), []);
};
const getHook = (cursor) => {
  const current = getCurrentFiber();
  const hooks =
    current.hooks || (current.hooks = { list: [], effect: [], layout: [] });
  if (cursor >= hooks.list.length) {
    hooks.list.push([]);
  }
  return [hooks.list[cursor], current];
};
const createContext = (initialValue) => {
  const contextComponent = ({ value, children }) => {
    const valueRef = useRef(value);
    const subscribers = useMemo(() => new Set(), EMPTY_ARR);
    if (valueRef.current !== value) {
      valueRef.current = value;
      subscribers.forEach((subscriber) => subscriber());
    }
    return children;
  };
  contextComponent.initialValue = initialValue;
  return contextComponent;
};
const useContext = (contextType) => {
  let subscribersSet;
  const triggerUpdate = useReducer(null, null)[1];
  useEffect(() => {
    return () => subscribersSet && subscribersSet.delete(triggerUpdate);
  }, EMPTY_ARR);
  let contextFiber = getCurrentFiber().parent;
  while (contextFiber && contextFiber.type !== contextType) {
    contextFiber = contextFiber.parent;
  }
  if (contextFiber) {
    const hooks = contextFiber.hooks.list;
    const [[value], [subscribers]] = hooks;
    subscribersSet = subscribers.add(triggerUpdate);
    return value.current;
  } else {
    return contextType.initialValue;
  }
};
const isChanged = (a, b) => {
  return (
    !a ||
    a.length !== b.length ||
    b.some((arg, index) => !Object.is(arg, a[index]))
  );
};

const queue = [];
const threshold = 5;
const transitions = [];
let deadline = 0;
const startTransition = (cb) => {
  transitions.push(cb) && translate();
};
const schedule = (callback) => {
  queue.push({ callback });
  startTransition(flush);
};
const task = (pending) => {
  const cb = () => transitions.splice(0, 1).forEach((c) => c());
  if (!pending && typeof queueMicrotask !== "undefined") {
    return () => queueMicrotask(cb);
  }
  if (typeof MessageChannel !== "undefined") {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = cb;
    return () => port2.postMessage(null);
  }
  return () => setTimeout(cb);
};
let translate = task(false);
const flush = () => {
  deadline = getTime() + threshold;
  let job = peek(queue);
  while (job && !shouldYield()) {
    const { callback } = job;
    job.callback = null;
    const next = callback();
    if (next) {
      job.callback = next;
    } else {
      queue.shift();
    }
    job = peek(queue);
  }
  job && (translate = task(shouldYield())) && startTransition(flush);
};
const shouldYield = () => {
  return false;
};
const getTime = () => Date.now();
const peek = (queue) => queue[0];

const commit = (fiber, deletions) => {
  let current = fiber.next;
  fiber.next = null;
  do {
    op(current);
  } while ((current = current.next));
  deletions.forEach(op);
};
const op = (fiber) => {
  if (fiber.lane & 64) {
    return;
  }
  if (fiber.lane === 8) {
    remove(fiber);
    return;
  }
  if (fiber.lane & 4) {
    if (fiber.isComp) {
      fiber.child.lane = fiber.lane;
      fiber.child.after = fiber.after;
      op(fiber.child);
      fiber.child.lane |= 64;
    } else {
      fiber.parentNode.insertBefore(fiber.node, fiber.after);
    }
  }
  if (fiber.lane & 2) {
    if (fiber.isComp) {
      fiber.child.lane = fiber.lane;
      op(fiber.child);
      fiber.child.lane |= 64;
    } else {
      updateElement(fiber.node, fiber.oldProps || {}, fiber.props);
    }
  }
  refer(fiber.ref, fiber.node);
};
const refer = (ref, dom) => {
  if (ref) isFn(ref) ? ref(dom) : (ref.current = dom);
};
const kidsRefer = (kids) => {
  kids.forEach((kid) => {
    kid.kids && kidsRefer(kid.kids);
    refer(kid.ref, null);
  });
};
const remove = (fiber) => {
  if (fiber.isComp) {
    fiber.hooks && fiber.hooks.list.forEach((e) => e[2] && e[2]());
    fiber.kids.forEach(remove);
  } else {
    kidsRefer(fiber.kids);
    fiber.parentNode.removeChild(fiber.node);
    refer(fiber.ref, null);
  }
  fiber.lane = 0;
};

let currentFiber = null;
let effectList = null;
let deletions = [];
const render = (vnode, node) => {
  const rootFiber = {
    node,
    props: { children: vnode },
  };
  update(rootFiber);
};
const update = (fiber) => {
  if (fiber && !(fiber.lane & 32)) {
    fiber.lane = 2 | 32;
    schedule(() => {
      effectList = fiber;
      return reconcile(fiber);
    });
  }
};
const reconcile = (fiber) => {
  while (fiber && !shouldYield()) fiber = capture(fiber);
  if (fiber) return reconcile.bind(null, fiber);
  return null;
};
const memo$1 = (fiber) => {
  if (fiber.type.memo && fiber.oldProps) {
    let scu = fiber.type.shouldUpdate || shouldUpdate;
    if (!scu(fiber.props, fiber.oldProps)) {
      return getSibling(fiber);
    }
  }
  return null;
};
const capture = (fiber) => {
  fiber.isComp = isFn(fiber.type);
  if (fiber.isComp) {
    const memoFiber = memo$1(fiber);
    if (memoFiber) {
      return memoFiber;
    }
    updateHook(fiber);
  } else {
    updateHost(fiber);
  }
  if (fiber.child) return fiber.child;
  const sibling = getSibling(fiber);
  return sibling;
};
const getSibling = (fiber) => {
  while (fiber) {
    bubble(fiber);
    if (fiber.lane & 32) {
      fiber.lane &= ~32;
      commit(fiber, deletions);
      return null;
    }
    if (fiber.sibling) return fiber.sibling;
    fiber = fiber.parent;
  }
  return null;
};
const bubble = (fiber) => {
  if (fiber.isComp) {
    if (fiber.hooks) {
      side(fiber.hooks.layout);
      schedule(() => side(fiber.hooks.effect));
    }
  }
};
const append = function (fiber) {
  effectList.next = fiber;
  effectList = fiber;
};
const shouldUpdate = (a, b) => {
  for (let i in a) if (!(i in b)) return true;
  for (let i in b) if (a[i] !== b[i]) return true;
};
const updateHook = (fiber) => {
  resetCursor();
  currentFiber = fiber;
  let children = fiber.type(fiber.props);
  diffKids(fiber, simpleVnode(children));
};
const updateHost = (fiber) => {
  fiber.parentNode = getParentNode(fiber) || {};
  if (!fiber.node) {
    if (fiber.type === "svg") fiber.lane |= 16;
    fiber.node = createElement(fiber);
  }
  fiber.childNodes = Array.from(fiber.node.childNodes || []);
  diffKids(fiber, fiber.props.children);
};
const simpleVnode = (type) => (isStr(type) ? createText(type) : type);
const getParentNode = (fiber) => {
  while ((fiber = fiber.parent)) {
    if (!fiber.isComp) return fiber.node;
  }
};
const diffKids = (fiber, children) => {
  var _a;
  let isMount = !fiber.kids,
    aCh = fiber.kids || [],
    bCh = (fiber.kids = arrayfy(children)),
    aHead = 0,
    bHead = 0,
    aTail = aCh.length - 1,
    bTail = bCh.length - 1;
  while (aHead <= aTail && bHead <= bTail) {
    if (!same(aCh[aHead], bCh[bHead])) break;
    clone(aCh[aHead++], bCh[bHead++], 2);
  }
  while (aHead <= aTail && bHead <= bTail) {
    if (!same(aCh[aTail], bCh[bTail])) break;
    clone(aCh[aTail--], bCh[bTail--], 2);
  }
  const { diff, keymap } = LCSdiff(bCh, aCh, bHead, bTail, aHead, aTail);
  for (
    let i = 0, aIndex = aHead, bIndex = bHead, mIndex;
    i < diff.length;
    i++
  ) {
    const op = diff[i];
    const after =
      (_a = fiber.node) === null || _a === void 0
        ? void 0
        : _a.childNodes[aIndex];
    if (op === 2) {
      if (!same(aCh[aIndex], bCh[bIndex])) {
        bCh[bIndex].lane = 4;
        bCh[bIndex].after = after;
        aCh[aIndex].lane = 8;
        deletions.push(aCh[aIndex]);
        append(bCh[bIndex]);
      } else {
        clone(aCh[aIndex], bCh[bIndex], 2);
      }
      aIndex++;
      bIndex++;
    } else if (op === 4) {
      let c = bCh[bIndex];
      mIndex = c.key != null ? keymap[c.key] : null;
      if (mIndex != null) {
        c.after = after;
        clone(aCh[mIndex], c, 4);
        aCh[mIndex] = undefined;
      } else {
        c.after = isMount ? null : after;
        c.lane = 4;
        append(c);
      }
      bIndex++;
    } else if (op === 8) {
      aIndex++;
    }
  }
  for (let i = 0, aIndex = aHead; i < diff.length; i++) {
    let op = diff[i];
    if (op === 2) {
      aIndex++;
    } else if (op === 8) {
      let c = aCh[aIndex];
      if (c !== undefined) {
        c.lane = 8;
        deletions.push(c);
      }
      aIndex++;
    }
  }
  for (let i = 0, prev = null, len = bCh.length; i < len; i++) {
    const child = bCh[i];
    if (fiber.lane & 16) {
      child.lane |= 16;
    }
    child.parent = fiber;
    if (i > 0) {
      prev.sibling = child;
    } else {
      fiber.child = child;
    }
    prev = child;
  }
};
function clone(a, b, lane) {
  b.hooks = a.hooks;
  b.ref = a.ref;
  b.node = a.node;
  b.oldProps = a.props;
  b.lane = lane;
  b.kids = a.kids;
  append(b);
}
const same = (a, b) => {
  return a && b && a.key === b.key && a.type === b.type;
};
const arrayfy = (arr) => (!arr ? [] : isArr(arr) ? arr : [arr]);
const side = (effects) => {
  effects.forEach((e) => e[2] && e[2]());
  effects.forEach((e) => (e[2] = e[0]()));
  effects.length = 0;
};
function LCSdiff(
  bArr,
  aArr,
  bHead = 0,
  bTail = bArr.length - 1,
  aHead = 0,
  aTail = aArr.length - 1
) {
  let keymap = {},
    unkeyed = [],
    idxUnkeyed = 0,
    ch,
    item,
    k,
    idxInOld,
    key;
  let newLen = bArr.length;
  let oldLen = aArr.length;
  let minLen = Math.min(newLen, oldLen);
  let tresh = Array(minLen + 1);
  tresh[0] = -1;
  for (var i = 1; i < tresh.length; i++) {
    tresh[i] = aTail + 1;
  }
  let link = Array(minLen);
  for (i = aHead; i <= aTail; i++) {
    item = aArr[i];
    key = item.key;
    if (key != null) {
      keymap[key] = i;
    } else {
      unkeyed.push(i);
    }
  }
  for (i = bHead; i <= bTail; i++) {
    ch = bArr[i];
    idxInOld = ch.key == null ? unkeyed[idxUnkeyed++] : keymap[ch.key];
    if (idxInOld != null) {
      k = bs(tresh, idxInOld);
      if (k >= 0) {
        tresh[k] = idxInOld;
        link[k] = { newi: i, oldi: idxInOld, prev: link[k - 1] };
      }
    }
  }
  k = tresh.length - 1;
  while (tresh[k] > aTail) k--;
  let ptr = link[k];
  let diff = Array(oldLen + newLen - k);
  let curNewi = bTail,
    curOldi = aTail;
  let d = diff.length - 1;
  while (ptr) {
    const { newi, oldi } = ptr;
    while (curNewi > newi) {
      diff[d--] = 4;
      curNewi--;
    }
    while (curOldi > oldi) {
      diff[d--] = 8;
      curOldi--;
    }
    diff[d--] = 2;
    curNewi--;
    curOldi--;
    ptr = ptr.prev;
  }
  while (curNewi >= bHead) {
    diff[d--] = 4;
    curNewi--;
  }
  while (curOldi >= aHead) {
    diff[d--] = 8;
    curOldi--;
  }
  return {
    diff,
    keymap,
  };
}
function bs(ktr, j) {
  let lo = 1;
  let hi = ktr.length - 1;
  while (lo <= hi) {
    let mid = (lo + hi) >>> 1;
    if (j < ktr[mid]) hi = mid - 1;
    else lo = mid + 1;
  }
  return lo;
}
const getCurrentFiber = () => currentFiber || null;
const isFn = (x) => typeof x === "function";
const isStr = (s) => typeof s === "number" || typeof s === "string";

const h = (type, props, ...kids) => {
  props = props || {};
  kids = flat(arrayfy(props.children || kids));
  if (kids.length) props.children = kids.length === 1 ? kids[0] : kids;
  const key = props.key || null;
  const ref = props.ref || null;
  if (key) props.key = undefined;
  if (ref) props.ref = undefined;
  return createVnode(type, props, key, ref);
};
const some = (x) => x != null && x !== true && x !== false;
const flat = (arr, target = []) => {
  arr.forEach((v) => {
    isArr(v)
      ? flat(v, target)
      : some(v) && target.push(isStr(v) ? createText(v) : v);
  });
  return target;
};
const createVnode = (type, props, key, ref) => ({
  type,
  props,
  key,
  ref,
});
const createText = (vnode) => ({
  type: "#text",
  props: { nodeValue: vnode + "" },
});
function Fragment(props) {
  return props.children;
}
function memo(fn, compare) {
  fn.memo = true;
  fn.shouldUpdate = compare;
  return fn;
}
const isArr = Array.isArray;

this.document = dom();
this.setTimeout = (cb) => cb();

render(h('div',null), document.body)

this.document = null;
this.setTimeout = null;

// render(h("text", {}, '123'));
