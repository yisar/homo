export function dom() {
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
                addedNodes: child,
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


            mutation(this, "characterData", { oldValue, value, rect: this.rect });
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
                    for (i = l.length; i--;) {
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

    class SVGElement extends Element { }

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
        record.target = target.__id; // 这里暂时只保留 id
        record.type = type;

        const cxy = [0, 0, 0, 0, 0]
        const cwh = [600, 600, 0, 0, 0]
        measure(target, 0, cxy, cwh)
        // layout(element, 1, 0, cxy, cwh, draw);

        for (let i = observers.length; i--;) {
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
                    setTimeout(flushMutations);
                }
            }
        }
    }

    function flushMutations() {
        pendingMutations = false;
        for (let i = observers.length; i--;) {
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
    for (let i in props) obj[i] = props[i];
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



const empty = [0, 0, 0, 0]
const { is } = Object
const { max } = Math

export function measure(obj, ddd, vxy, vwh) {
    const { props: { style }, childNodes: children } = obj
    const direction = +(!(style.direction?.charCodeAt(0) === 114)) // direction: (r)ow, column*
    const xxx = ddd // is row/column
    const yyy = +(!xxx) // opposite of is row/column

    const cxy = [0, 0, 0, 0, 0] // x/y/length/space/offset
    const cwh = [style.width ?? -0, style.height ?? -0, 0, 0, 0] // w/h/flex/used/implict
    const mmm = style.margin ?? empty
    obj.returns = { xxx, cxy, cwh }

    if (style.display === 'none') {
        return void (cwh[0] = cwh[1] = 0)
    }
    if ((style.position ?? 'r')[0] === 'r') {
        vxy[2] += 1
        vwh[2] += max(0, style.flex | 0)
    } // position: (r)elative, accumulate length/flex
    for (let i = 0; i < children.length; ++i) {
        measure(children[i], direction, cxy, cwh)
    } // visit all child nodes
    vwh[3] += (is(cwh[xxx], -0) ? cwh[3] : cwh[xxx]) + (mmm[xxx + 0] + mmm[xxx + 2]) // implicit inline size
    vwh[4] = max(vwh[4], (is(cwh[yyy], -0) ? cwh[4] : cwh[yyy]) + (mmm[yyy + 0] + mmm[yyy + 2])) // implicit block size
}

export function layout(obj, aaa, jjj, vxy, vwh, gpu) {
    const { props: { style }, childNodes: children, returns: { xxx, cxy, cwh } } = obj
    const yyy = +(!xxx) // opposite of is row/column
    const ppp = style.padding ?? empty
    const mmm = style.margin ?? empty
    const position = +((style.position ?? 'r')[0] === 'r') // position: (r)elative*, absolute, fixed
    const self = style.alignSelf?.charCodeAt(2)
    const align = style.alignItems?.charCodeAt(2) ?? 97

    const justify = style.justifyContent?.charCodeAt(2) ?? 0
    if (self) aaa = self | 0 // al(i)gn-self, by default we assume the aligment of the parents align-items but if there's an align-self we use that
    if (justify === 100) children = children.reverse() // justify-content implemntation detail
    // start layout algorithm
    init: {
        cxy[xxx] += mmm[xxx + 0] + ppp[xxx + 0] + vxy[4] // margin-start + padding.start + cursor
        cxy[yyy] += mmm[yyy + 0] + ppp[yyy + 0] // margin-start + padding.start
    }
    size: {
        cwh[3] = cwh[3] + (ppp[xxx + 0] + ppp[xxx + 2] + ((cxy[2] - 1) * max(0, style.gap ?? 0))) // used space += padding + (n * gap)
        cwh[xxx] = is(cwh[xxx], -0) ? (!position ? cwh[3] : (vwh[xxx] - vwh[3]) * ((max(0, style.flex | 0) || 1) / vwh[2])) : cwh[xxx] // if implicit sized then size = (total space - used space) * (flex or 1)/(total flex)
        cwh[yyy] = is(cwh[yyy], -0) ? (!position ? cwh[4] : (vwh[4] || vwh[yyy])) : cwh[yyy]
    }
    position: { // poisition: top, right, bottom, left
        for (let [lt, rb, ww, xy, wh] of [[style.left ?? -0, style.right ?? -0, cwh[0], 0, 1], [style.top ?? -0, style.bottom ?? -0, cwh[1], 0, 1]])
            if (!is(lt, -0) && !is(rb, -0) && is(ww, -0)) { // left, right set while width is undefined
                cxy[xy] = (position ? cxy : vxy)[xy] + lt // node[x/y] = root[x/y] + l/t
                cwh[wh] = vwh[wh] - lt - rb // node[w/h] = root[w/h] - l/t - r/b
            } else if (lt != null) cxy[xy] = (position ? cxy : vxy)[xy] + lt // when only l/t, node[x/y] = root/node[x/y] + l/t dependant on absolute position
            else if (rb != null) cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]) // when only right/bottom node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
            else if (!position) cxy[xy] = vxy[xy] // node[x/y] = root[x/y]
    }
    align: { // algin-self / align-items: start*, end, center, stretch
        let [yx, hw] = [[1, 1], [0, 0]][xxx] // root orientation
        if (position) switch (aaa) { // not absolute?
            case 100:
                cxy[yx] = vwh[hw] - cwh[hw]
                break  // en(d)
            case 110:
                cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2
                break // ce(n)ter
            case 114:
                cxy[yx] = vwh[hw]
                break // st(r)etch
        }
    }
    justify: { // justify: start*, end, center, stretch
        let [xy, wh] = [[0, 0], [1, 1]][xxx] // root orientation
        if (position) switch (jjj) { // not absolute?
            case 100:
                cxy[xy] = vwh[wh] - cwh[wh]
                break // en(d)
            case 110:
                cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2
                break // ce(n)ter given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
            case 114:
                cxy[xy] = vwh[wh]
                break // st(r)etch
        }
    }
    draw: {
        gpu(obj, [vxy[0] + cxy[0], vxy[1] + cxy[1]], [cwh[0], cwh[1]]) // draw to canvas within the same 2nd pass
    }
    each: {
        for (var i = 0; i < children.length; i++) {
            layout(children[i], align, justify, cxy, cwh, gpu)
        }// visit all child nodes
    }
    move: {
        cxy[xxx] += mmm[yyy + 2] + ppp[yyy + 2] + cwh[xxx] // margin.end + padding.end + width
        vxy[4] += cxy[xxx] // move cursor
    }
}
