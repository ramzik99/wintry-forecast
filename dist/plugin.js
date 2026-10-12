const __pluginConfig =  {
  "name": "windy-plugin-snowline-map-100m",
  "version": "1000.0.5",
  "icon": "❄️",
  "title": "Wintry forecast",
  "description": "Concise terrain-aware winter forecast: type, terrain, snowline, precipitation, estimated new snow and timing first; a clean forecast timeline and optional hover/touch sounding.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/wintry-forecast",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": true,
  "listenToSingleclick": true,
  "built": 1791826155795,
  "builtReadable": "2026-10-12T17:29:15.795Z"
};

// transformCode: import { register, release, singleclick } from '@windy/singleclick';
const { register, release, singleclick } = W.singleclick;

// transformCode: import { map, layerOrder, getMapTiles } from '@windy/map';
const { map, layerOrder, getMapTiles } = W.map;

// transformCode: import store from '@windy/store';
const store = W.store;

// transformCode: import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
const { createFullRenderingParams, getDataZoom } = W.renderUtils;

// transformCode: import { TileLayerInterpolator } from '@windy/tileInterpolator';
const { TileLayerInterpolator } = W.tileInterpolator;

// transformCode: import { tileLayerSource } from '@windy/tileLayerSource';
const { tileLayerSource } = W.tileLayerSource;

// transformCode: import { applyUrlTemplate } from '@windy/tileHelpers';
const { applyUrlTemplate } = W.tileHelpers;

// transformCode: import { getPointForecastData, getMeteogramForecastData, getElevation } from '@windy/fetch';
const { getPointForecastData, getMeteogramForecastData, getElevation } = W.fetch;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

function null_to_empty(value) {
	return value == null ? '' : value;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} name
 * @returns {SVGElement}
 */
function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @returns {Text} */
function empty() {
	return text('');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @returns {(event: any) => any} */
function prevent_default(fn) {
	return function (event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => any} */
function stop_propagation(fn) {
	return function (event) {
		event.stopPropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @returns {(event: any) => void} */
function self(fn) {
	return function (event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @template T
 * @param {string} type
 * @param {T} [detail]
 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
 * @returns {CustomEvent<T>}
 */
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
	return new CustomEvent(type, { detail, bubbles, cancelable });
}
/** */
class HtmlTag {
	/**
	 * @private
	 * @default false
	 */
	is_svg = false;
	/** parent for creating node */
	e = undefined;
	/** html tag nodes */
	n = undefined;
	/** target */
	t = undefined;
	/** anchor */
	a = undefined;
	constructor(is_svg = false) {
		this.is_svg = is_svg;
		this.e = this.n = null;
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	c(html) {
		this.h(html);
	}

	/**
	 * @param {string} html
	 * @param {HTMLElement | SVGElement} target
	 * @param {HTMLElement | SVGElement} anchor
	 * @returns {void}
	 */
	m(html, target, anchor = null) {
		if (!this.e) {
			if (this.is_svg)
				this.e = svg_element(/** @type {keyof SVGElementTagNameMap} */ (target.nodeName));
			/** #7364  target for <template> may be provided as #document-fragment(11) */ else
				this.e = element(
					/** @type {keyof HTMLElementTagNameMap} */ (
						target.nodeType === 11 ? 'TEMPLATE' : target.nodeName
					)
				);
			this.t =
				target.tagName !== 'TEMPLATE'
					? target
					: /** @type {HTMLTemplateElement} */ (target).content;
			this.c(html);
		}
		this.i(anchor);
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	h(html) {
		this.e.innerHTML = html;
		this.n = Array.from(
			this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes
		);
	}

	/**
	 * @returns {void} */
	i(anchor) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert(this.t, this.n[i], anchor);
		}
	}

	/**
	 * @param {string} html
	 * @returns {void}
	 */
	p(html) {
		this.d();
		this.h(html);
		this.i(this.a);
	}

	/**
	 * @returns {void} */
	d() {
		this.n.forEach(detach);
	}
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

/**
 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
 * ```ts
 * const dispatch = createEventDispatcher<{
 *  loaded: never; // does not take a detail argument
 *  change: string; // takes a detail argument of type string, which is required
 *  optional: number | null; // takes an optional detail argument of type number
 * }>();
 * ```
 *
 * https://svelte.dev/docs/svelte#createeventdispatcher
 * @template {Record<string, any>} [EventMap=any]
 * @returns {import('./public.js').EventDispatcher<EventMap>}
 */
function createEventDispatcher() {
	const component = get_current_component();
	return (type, detail, { cancelable = false } = {}) => {
		const callbacks = component.$$.callbacks[type];
		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
			callbacks.slice().forEach((fn) => {
				fn.call(component, event);
			});
			return !event.defaultPrevented;
		}
		return true;
	};
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
/**
 * @param component
 * @param event
 * @returns {void}
 */
function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];
	if (callbacks) {
		// @ts-ignore
		callbacks.slice().forEach((fn) => fn.call(this, event));
	}
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

/** @returns {void} */
function add_flush_callback(fn) {
	flush_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @type {Outro}
 */
let outros;

/**
 * @returns {void} */
function group_outros() {
	outros = {
		r: 0,
		c: [],
		p: outros // parent group
	};
}

/**
 * @returns {void} */
function check_outros() {
	if (!outros.r) {
		run_all(outros.c);
	}
	outros = outros.p;
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} local
 * @param {0 | 1} [detach]
 * @param {() => void} [callback]
 * @returns {void}
 */
function transition_out(block, local, detach, callback) {
	if (block && block.o) {
		if (outroing.has(block)) return;
		outroing.add(block);
		outros.c.push(() => {
			outroing.delete(block);
			if (callback) {
				if (detach) block.d(1);
				callback();
			}
		});
		block.o(local);
	} else if (callback) {
		callback();
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function bind(component, name, callback) {
	const index = component.$$.props[name];
	if (index !== undefined) {
		component.$$.bound[index] = callback;
		callback(component.$$.ctx[index]);
	}
}

/** @returns {void} */
function create_component(block) {
	block && block.c();
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

/** Windy's raw ECMWF thunder/lightdens field, never CAPE or observed strikes. */ const LIGHTNING_DISPLAY_THRESHOLD = 0.025;
/** Match Windy's TileLayerInterpolator: its zoom comes from the 512 px MapLibre map. */ function lightningTileZoomIndex(mapLibreZoom) {
    return Math.round(Math.max(2, Math.min(10, mapLibreZoom))) + 1;
}
function hasForecastLightning(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= LIGHTNING_DISPLAY_THRESHOLD;
}
/** Screen spacing adapts at every zoom; the raw ECMWF field retains its native resolution. */ function stormSpacing(zoom, latitude) {
    return 72 * 40075016.686 * Math.cos(latitude * Math.PI / 180) / (256 * 2 ** zoom);
}
/** A zoomed viewport may show only the corner of a model-scale cell.
 * Sample its visible footprint so the forecast symbol stays on screen. */ function stormSamplePoint(bounds) {
    return {
        lat: (bounds[0][0] + bounds[2][0]) / 2,
        lon: (bounds[0][1] + bounds[1][1]) / 2
    };
}

const cache$1 = new Map();
function photonPlaces(data) {
    if (!Array.isArray(data?.features)) throw new Error('Invalid place response');
    const places = new Map();
    for (const feature of data.features){
        const [lon, lat] = feature?.geometry?.coordinates ?? [];
        if (feature?.geometry?.type !== 'Point' || typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
        const p = feature.properties ?? {};
        const label = (v)=>typeof v === 'string' ? v.trim() : '';
        const primary = label(p.name) || [
            label(p.housenumber),
            label(p.street)
        ].filter(Boolean).join(' ') || label(p.city) || label(p.postcode);
        if (!primary) continue;
        const secondary = [
            ...new Set([
                p.city,
                p.state,
                p.country
            ].map(label).filter((v)=>v && v !== primary))
        ].join(', ');
        places.set(`${lat.toFixed(5)},${lon.toFixed(5)},${primary}`, {
            lat,
            lon,
            primary,
            secondary
        });
    }
    return [
        ...places.values()
    ].slice(0, 5);
}
async function autocompletePlaces(query, signal) {
    const text = query.trim();
    if (text.length < 3) return [];
    signal.throwIfAborted();
    const key = text.toLowerCase();
    if (cache$1.has(key)) return cache$1.get(key);
    const request = new AbortController();
    const cancel = ()=>request.abort();
    signal.addEventListener('abort', cancel, {
        once: true
    });
    const timeout = setTimeout(cancel, 10000);
    try {
        const params = new URLSearchParams({
            q: text,
            limit: '5'
        });
        const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
            signal: request.signal,
            headers: {
                Accept: 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Place search failed (${response.status})`);
        const places = photonPlaces(await response.json());
        signal.throwIfAborted();
        cache$1.set(key, places);
        if (cache$1.size > 100) cache$1.delete(cache$1.keys().next().value);
        return places;
    } catch (error) {
        if (signal.aborted) throw error;
        throw new Error('Place search unavailable');
    } finally{
        clearTimeout(timeout);
        signal.removeEventListener('abort', cancel);
    }
}

/* src\PlaceSearch.svelte generated by Svelte v4.2.20 */

function add_css$4(target) {
	append_styles(target, "svelte-i6hwtj", ".place-search.svelte-i6hwtj.svelte-i6hwtj{position:relative;margin-top:5px}form.svelte-i6hwtj.svelte-i6hwtj{display:flex;flex-direction:column;gap:5px}.search-line.svelte-i6hwtj.svelte-i6hwtj{display:flex}input.svelte-i6hwtj.svelte-i6hwtj,button.svelte-i6hwtj.svelte-i6hwtj{box-sizing:border-box;border:1px solid rgba(255, 255, 255, 0.14);border-radius:7px;background:rgba(13, 16, 20, 0.76);color:white}input.svelte-i6hwtj.svelte-i6hwtj{width:100%;min-width:0;height:28px;padding:0 10px;font-size:11px;outline:none}input.svelte-i6hwtj.svelte-i6hwtj:focus{border-color:rgba(80, 190, 255, 0.78);box-shadow:0 0 0 1px rgba(80, 190, 255, 0.18)}input.svelte-i6hwtj.svelte-i6hwtj::placeholder{color:rgba(255, 255, 255, 0.46)}button.svelte-i6hwtj.svelte-i6hwtj{cursor:pointer}button.svelte-i6hwtj.svelte-i6hwtj:disabled{opacity:0.34;cursor:default}.utility-row.svelte-i6hwtj.svelte-i6hwtj{display:grid;grid-template-columns:1.2fr 1fr;gap:5px}.utility-row.has-clear.svelte-i6hwtj.svelte-i6hwtj{grid-template-columns:1.2fr 1fr 28px}.utility-row.svelte-i6hwtj button.svelte-i6hwtj{display:flex;align-items:center;justify-content:center;gap:5px;min-width:0;height:28px;padding:0 7px;color:rgba(255, 255, 255, 0.78);font-size:9px;line-height:1;font-weight:800;background:rgba(255, 255, 255, 0.045)}.location-button.svelte-i6hwtj.svelte-i6hwtj{border-color:rgba(80, 190, 255, 0.28)}.location-button.svelte-i6hwtj.svelte-i6hwtj:hover,.location-button.svelte-i6hwtj.svelte-i6hwtj:focus{background:rgba(80, 190, 255, 0.14);border-color:rgba(80, 190, 255, 0.58);outline:none}.location-button.busy.svelte-i6hwtj.svelte-i6hwtj{color:rgba(112, 215, 255, 0.9)}.location-icon.svelte-i6hwtj.svelte-i6hwtj{font-size:15px;line-height:1;color:#70d7ff}.fav-button.svelte-i6hwtj span.svelte-i6hwtj:first-child{font-size:13px}.fav-button.active.svelte-i6hwtj.svelte-i6hwtj{color:#ffe45c;border-color:rgba(255, 228, 92, 0.48);background:rgba(255, 228, 92, 0.08)}.clear-button.svelte-i6hwtj span.svelte-i6hwtj:first-child{font-size:14px;font-weight:500}.location-message.svelte-i6hwtj.svelte-i6hwtj{margin-top:5px;padding:5px 7px;border-radius:6px;background:rgba(255, 157, 61, 0.1);color:rgba(255, 207, 160, 0.95);font-size:8.7px;line-height:1.2}.results.svelte-i6hwtj.svelte-i6hwtj{position:absolute;z-index:5000;left:0;right:0;top:calc(100% + 4px);max-height:min(300px, 50vh);overflow-y:auto;border:1px solid rgba(255, 255, 255, 0.16);border-radius:8px;background:rgba(18, 21, 25, 0.985);box-shadow:0 6px 18px rgba(0, 0, 0, 0.42)}.result-row.svelte-i6hwtj.svelte-i6hwtj{display:grid;grid-template-columns:1fr 34px;border-bottom:1px solid rgba(255, 255, 255, 0.08)}.result.svelte-i6hwtj.svelte-i6hwtj{display:block;width:100%;min-width:0;padding:7px 8px;border:0;border-radius:0;background:transparent;color:rgba(255, 255, 255, 0.94);text-align:left;cursor:pointer}.result.svelte-i6hwtj.svelte-i6hwtj:hover,.result.svelte-i6hwtj.svelte-i6hwtj:focus,.star.svelte-i6hwtj.svelte-i6hwtj:hover,.star.svelte-i6hwtj.svelte-i6hwtj:focus{background:rgba(80, 190, 255, 0.16);outline:none}.result-main.svelte-i6hwtj.svelte-i6hwtj{display:block;font-size:10px;line-height:1.15;font-weight:750}.result-sub.svelte-i6hwtj.svelte-i6hwtj{display:block;margin-top:2px;font-size:8.5px;line-height:1.1;opacity:0.6}.star.svelte-i6hwtj.svelte-i6hwtj{border:0;border-left:1px solid rgba(255, 255, 255, 0.08);border-radius:0;background:transparent;color:rgba(255, 255, 255, 0.52);font-size:15px;cursor:pointer}.star.saved.svelte-i6hwtj.svelte-i6hwtj{color:#ffe45c}.empty.svelte-i6hwtj.svelte-i6hwtj,.credit.svelte-i6hwtj.svelte-i6hwtj{padding:6px 8px;color:rgba(255, 255, 255, 0.58);font-size:8.5px;line-height:1.15}.credit.svelte-i6hwtj.svelte-i6hwtj{text-align:right}.search-line.svelte-i6hwtj input.svelte-i6hwtj{height:42px;font-size:14px;padding:0 10px}.utility-row.svelte-i6hwtj button.svelte-i6hwtj{height:40px;font-size:12px}.result-main.svelte-i6hwtj.svelte-i6hwtj{font-size:13px}.result-sub.svelte-i6hwtj.svelte-i6hwtj{font-size:11px;line-height:1.4}.result.svelte-i6hwtj.svelte-i6hwtj{min-height:44px}.location-message.svelte-i6hwtj.svelte-i6hwtj,.empty.svelte-i6hwtj.svelte-i6hwtj,.credit.svelte-i6hwtj.svelte-i6hwtj{font-size:11px;line-height:1.4}.star.svelte-i6hwtj.svelte-i6hwtj{min-width:36px}.utility-row.has-clear.svelte-i6hwtj.svelte-i6hwtj{grid-template-columns:1.2fr 1fr 36px}");
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[37] = list[i];
	return child_ctx;
}

// (28:6) {#if query || open || hasSelection}
function create_if_block_5$3(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.innerHTML = `<span aria-hidden="true" class="svelte-i6hwtj">×</span>`;
			attr(button, "class", "clear-button svelte-i6hwtj");
			attr(button, "type", "button");
			attr(button, "aria-label", "Clear search and selected place");
			attr(button, "title", "Clear");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*clearSearch*/ ctx[15]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (37:2) {#if locationError}
function create_if_block_4$3(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*locationError*/ ctx[6]);
			attr(div, "class", "location-message svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*locationError*/ 64) set_data(t, /*locationError*/ ctx[6]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (41:2) {#if open}
function create_if_block$3(ctx) {
	let div;

	function select_block_type(ctx, dirty) {
		if (/*visibleResults*/ ctx[11].length) return create_if_block_1$3;
		return create_else_block$3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "results svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if_block.d();
		}
	};
}

// (61:6) {:else}
function create_else_block$3(ctx) {
	let div;

	let t_value = (/*showFavourites*/ ctx[0]
	? 'No saved places'
	: /*locationError*/ ctx[6]
		? 'Try another place or tap the map'
		: /*searching*/ ctx[3] || /*searchTimer*/ ctx[9]
			? 'Searching…'
			: /*hasSearched*/ ctx[4]
				? 'No places found'
				: 'Type at least 3 characters') + "";

	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "empty svelte-i6hwtj");
			attr(div, "role", "status");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*showFavourites, locationError, searching, searchTimer, hasSearched*/ 601 && t_value !== (t_value = (/*showFavourites*/ ctx[0]
			? 'No saved places'
			: /*locationError*/ ctx[6]
				? 'Try another place or tap the map'
				: /*searching*/ ctx[3] || /*searchTimer*/ ctx[9]
					? 'Searching…'
					: /*hasSearched*/ ctx[4]
						? 'No places found'
						: 'Type at least 3 characters') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (43:6) {#if visibleResults.length}
function create_if_block_1$3(ctx) {
	let t;
	let if_block_anchor;
	let each_value = ensure_array_like(/*visibleResults*/ ctx[11]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	let if_block = !/*showFavourites*/ ctx[0] && /*remoteResults*/ ctx[1].length && create_if_block_2$3();

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*isFavourite, visibleResults, toggleFavourite, chooseResult*/ 1062912) {
				each_value = ensure_array_like(/*visibleResults*/ ctx[11]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(t.parentNode, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (!/*showFavourites*/ ctx[0] && /*remoteResults*/ ctx[1].length) {
				if (if_block) ; else {
					if_block = create_if_block_2$3();
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(t);
				detach(if_block_anchor);
			}

			destroy_each(each_blocks, detaching);
			if (if_block) if_block.d(detaching);
		}
	};
}

// (48:14) {#if result.secondary}
function create_if_block_3$3(ctx) {
	let span;
	let t_value = /*result*/ ctx[37].secondary + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "result-sub svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*visibleResults*/ 2048 && t_value !== (t_value = /*result*/ ctx[37].secondary + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (44:8) {#each visibleResults as result}
function create_each_block$2(ctx) {
	let div;
	let button0;
	let span;
	let t0_value = /*result*/ ctx[37].primary + "";
	let t0;
	let t1;
	let t2;
	let button1;
	let t3_value = (/*isFavourite*/ ctx[12](/*result*/ ctx[37]) ? '★' : '☆') + "";
	let t3;
	let button1_aria_label_value;
	let button1_title_value;
	let mounted;
	let dispose;
	let if_block = /*result*/ ctx[37].secondary && create_if_block_3$3(ctx);

	function click_handler() {
		return /*click_handler*/ ctx[28](/*result*/ ctx[37]);
	}

	function click_handler_1() {
		return /*click_handler_1*/ ctx[29](/*result*/ ctx[37]);
	}

	return {
		c() {
			div = element("div");
			button0 = element("button");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			button1 = element("button");
			t3 = text(t3_value);
			attr(span, "class", "result-main svelte-i6hwtj");
			attr(button0, "class", "result svelte-i6hwtj");
			attr(button0, "type", "button");
			attr(button1, "class", "star svelte-i6hwtj");
			attr(button1, "type", "button");

			attr(button1, "aria-label", button1_aria_label_value = /*isFavourite*/ ctx[12](/*result*/ ctx[37])
			? 'Remove saved place'
			: 'Save place');

			attr(button1, "title", button1_title_value = /*isFavourite*/ ctx[12](/*result*/ ctx[37])
			? 'Remove saved place'
			: 'Save place');

			toggle_class(button1, "saved", /*isFavourite*/ ctx[12](/*result*/ ctx[37]));
			attr(div, "class", "result-row svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button0);
			append(button0, span);
			append(span, t0);
			append(button0, t1);
			if (if_block) if_block.m(button0, null);
			append(div, t2);
			append(div, button1);
			append(button1, t3);

			if (!mounted) {
				dispose = [
					listen(button0, "click", click_handler),
					listen(button1, "click", click_handler_1)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*visibleResults*/ 2048 && t0_value !== (t0_value = /*result*/ ctx[37].primary + "")) set_data(t0, t0_value);

			if (/*result*/ ctx[37].secondary) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_3$3(ctx);
					if_block.c();
					if_block.m(button0, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*visibleResults*/ 2048 && t3_value !== (t3_value = (/*isFavourite*/ ctx[12](/*result*/ ctx[37]) ? '★' : '☆') + "")) set_data(t3, t3_value);

			if (dirty[0] & /*visibleResults*/ 2048 && button1_aria_label_value !== (button1_aria_label_value = /*isFavourite*/ ctx[12](/*result*/ ctx[37])
			? 'Remove saved place'
			: 'Save place')) {
				attr(button1, "aria-label", button1_aria_label_value);
			}

			if (dirty[0] & /*visibleResults*/ 2048 && button1_title_value !== (button1_title_value = /*isFavourite*/ ctx[12](/*result*/ ctx[37])
			? 'Remove saved place'
			: 'Save place')) {
				attr(button1, "title", button1_title_value);
			}

			if (dirty[0] & /*isFavourite, visibleResults*/ 6144) {
				toggle_class(button1, "saved", /*isFavourite*/ ctx[12](/*result*/ ctx[37]));
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if (if_block) if_block.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (60:8) {#if !showFavourites && remoteResults.length}
function create_if_block_2$3(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Search: Photon · © OpenStreetMap contributors";
			attr(div, "class", "credit svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment$5(ctx) {
	let div2;
	let form;
	let div0;
	let input;
	let t0;
	let div1;
	let button0;
	let span0;
	let t2;
	let span1;
	let t3_value = (/*locating*/ ctx[5] ? 'Locating…' : 'My location') + "";
	let t3;
	let t4;
	let button1;
	let t7;
	let t8;
	let t9;
	let mounted;
	let dispose;
	let if_block0 = (/*query*/ ctx[2] || /*open*/ ctx[7] || /*hasSelection*/ ctx[8]) && create_if_block_5$3(ctx);
	let if_block1 = /*locationError*/ ctx[6] && create_if_block_4$3(ctx);
	let if_block2 = /*open*/ ctx[7] && create_if_block$3(ctx);

	return {
		c() {
			div2 = element("div");
			form = element("form");
			div0 = element("div");
			input = element("input");
			t0 = space();
			div1 = element("div");
			button0 = element("button");
			span0 = element("span");
			span0.textContent = "⌖";
			t2 = space();
			span1 = element("span");
			t3 = text(t3_value);
			t4 = space();
			button1 = element("button");
			button1.innerHTML = `<span class="svelte-i6hwtj">★</span><span class="svelte-i6hwtj">Saved</span>`;
			t7 = space();
			if (if_block0) if_block0.c();
			t8 = space();
			if (if_block1) if_block1.c();
			t9 = space();
			if (if_block2) if_block2.c();
			attr(input, "aria-label", "Search places");
			attr(input, "placeholder", "Search place…");
			attr(input, "title", "Search a place, use your location, or tap the map");
			attr(input, "autocomplete", "off");
			attr(input, "spellcheck", "false");
			attr(input, "class", "svelte-i6hwtj");
			attr(div0, "class", "search-line svelte-i6hwtj");
			attr(span0, "class", "location-icon svelte-i6hwtj");
			attr(button0, "class", "location-button svelte-i6hwtj");
			attr(button0, "type", "button");
			attr(button0, "aria-label", "Use current location");
			attr(button0, "title", "Use current location");
			button0.disabled = /*locating*/ ctx[5];
			toggle_class(button0, "busy", /*locating*/ ctx[5]);
			attr(button1, "class", "fav-button svelte-i6hwtj");
			attr(button1, "type", "button");
			attr(button1, "aria-label", "Show saved places");
			attr(button1, "title", "Saved places");
			toggle_class(button1, "active", /*showFavourites*/ ctx[0]);
			attr(div1, "class", "utility-row svelte-i6hwtj");
			toggle_class(div1, "has-clear", /*query*/ ctx[2] || /*open*/ ctx[7] || /*hasSelection*/ ctx[8]);
			attr(form, "class", "svelte-i6hwtj");
			attr(div2, "class", "place-search svelte-i6hwtj");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, form);
			append(form, div0);
			append(div0, input);
			set_input_value(input, /*query*/ ctx[2]);
			append(form, t0);
			append(form, div1);
			append(div1, button0);
			append(button0, span0);
			append(button0, t2);
			append(button0, span1);
			append(span1, t3);
			append(div1, t4);
			append(div1, button1);
			append(div1, t7);
			if (if_block0) if_block0.m(div1, null);
			append(div2, t8);
			if (if_block1) if_block1.m(div2, null);
			append(div2, t9);
			if (if_block2) if_block2.m(div2, null);

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[24]),
					listen(input, "input", /*scheduleSearch*/ ctx[17]),
					listen(input, "keydown", /*handleKeydown*/ ctx[21]),
					listen(input, "keyup", stop_propagation(/*keyup_handler*/ ctx[23])),
					listen(input, "focus", /*focus_handler*/ ctx[25]),
					listen(input, "compositionstart", /*compositionstart_handler*/ ctx[26]),
					listen(input, "compositionend", /*compositionend_handler*/ ctx[27]),
					listen(button0, "click", /*useCurrentLocation*/ ctx[16]),
					listen(button1, "click", /*toggleFavourites*/ ctx[19]),
					listen(form, "submit", prevent_default(/*submitSearch*/ ctx[18]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*query*/ 4 && input.value !== /*query*/ ctx[2]) {
				set_input_value(input, /*query*/ ctx[2]);
			}

			if (dirty[0] & /*locating*/ 32 && t3_value !== (t3_value = (/*locating*/ ctx[5] ? 'Locating…' : 'My location') + "")) set_data(t3, t3_value);

			if (dirty[0] & /*locating*/ 32) {
				button0.disabled = /*locating*/ ctx[5];
			}

			if (dirty[0] & /*locating*/ 32) {
				toggle_class(button0, "busy", /*locating*/ ctx[5]);
			}

			if (dirty[0] & /*showFavourites*/ 1) {
				toggle_class(button1, "active", /*showFavourites*/ ctx[0]);
			}

			if (/*query*/ ctx[2] || /*open*/ ctx[7] || /*hasSelection*/ ctx[8]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_5$3(ctx);
					if_block0.c();
					if_block0.m(div1, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*query, open, hasSelection*/ 388) {
				toggle_class(div1, "has-clear", /*query*/ ctx[2] || /*open*/ ctx[7] || /*hasSelection*/ ctx[8]);
			}

			if (/*locationError*/ ctx[6]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_4$3(ctx);
					if_block1.c();
					if_block1.m(div2, t9);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*open*/ ctx[7]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block$3(ctx);
					if_block2.c();
					if_block2.m(div2, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div2);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

const STORAGE_KEY = 'snowline:favourites:v1';
const FAVOURITES_CHANGED_EVENT$1 = 'wintry:favourites-changed';

function resultKey(item) {
	return `${item.lat.toFixed(5)},${item.lon.toFixed(5)}`;
}

function instance$5($$self, $$props, $$invalidate) {
	let visibleResults;
	const dispatch = createEventDispatcher();
	let query = '';
	let searching = false;
	let hasSearched = false;
	let locating = false;
	let locationError = '';
	let open = false;
	let showFavourites = false;
	let hasSelection = false;
	let remoteResults = [];
	let favourites = [];
	let controller = null;
	let requestId = 0;
	let searchTimer = null;
	let composing = false;

	function loadFavourites() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);

			if (!raw) {
				$$invalidate(22, favourites = []);
				return;
			}

			const parsed = JSON.parse(raw);

			if (!Array.isArray(parsed)) {
				$$invalidate(22, favourites = []);
				return;
			}

			$$invalidate(22, favourites = parsed.map(item => ({
				lat: Number(item?.lat),
				lon: Number(item?.lon),
				primary: String(item?.primary ?? 'Saved place'),
				secondary: String(item?.secondary ?? '')
			})).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lon)));
		} catch {
			$$invalidate(22, favourites = []);
		}
	}

	function saveFavourites() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
			window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGED_EVENT$1));
		} catch(error) {
			console.warn('Wintry forecast could not save places', error);
		}
	}

	function isFavourite(result) {
		const key = resultKey(result);
		return favourites.some(item => resultKey(item) === key);
	}

	function toggleFavourite(result) {
		const key = resultKey(result);
		if (isFavourite(result)) $$invalidate(22, favourites = favourites.filter(item => resultKey(item) !== key)); else $$invalidate(22, favourites = [{ ...result }, ...favourites].slice(0, 30));
		saveFavourites();
		$$invalidate(7, open = true);
	}

	function clearPendingSearch() {
		if (searchTimer) clearTimeout(searchTimer);
		$$invalidate(9, searchTimer = null);
		controller?.abort();
		controller = null;
		requestId += 1;
		$$invalidate(5, locating = false);
		$$invalidate(3, searching = false);
	}

	function clearSearch() {
		clearPendingSearch();
		$$invalidate(2, query = '');
		$$invalidate(6, locationError = '');
		$$invalidate(7, open = false);
		$$invalidate(0, showFavourites = false);
		$$invalidate(8, hasSelection = false);
		$$invalidate(1, remoteResults = []);
		dispatch('clear');
	}

	function useCurrentLocation() {
		clearPendingSearch();
		$$invalidate(2, query = '');
		$$invalidate(6, locationError = '');
		$$invalidate(7, open = false);
		$$invalidate(0, showFavourites = false);
		$$invalidate(1, remoteResults = []);

		if (!navigator.geolocation) {
			$$invalidate(6, locationError = 'Location is not available on this device.');
			return;
		}

		$$invalidate(5, locating = true);
		const id = requestId;

		navigator.geolocation.getCurrentPosition(
			position => {
				if (id !== requestId) return;
				$$invalidate(5, locating = false);
				const lat = Number(position.coords.latitude);
				const lon = Number(position.coords.longitude);

				if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
					$$invalidate(6, locationError = 'Could not read your location.');
					return;
				}

				$$invalidate(8, hasSelection = true);

				dispatch('select', {
					lat,
					lon,
					primary: 'My location',
					secondary: 'Current device location'
				});
			},
			error => {
				if (id !== requestId) return;
				$$invalidate(5, locating = false);
				if (error.code === 1) $$invalidate(6, locationError = 'Location permission was denied.'); else if (error.code === 2) $$invalidate(6, locationError = 'Current location is unavailable.'); else $$invalidate(6, locationError = 'Location request timed out.');
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000
			}
		);
	}

	function scheduleSearch() {
		clearPendingSearch();
		$$invalidate(4, hasSearched = false);
		$$invalidate(6, locationError = '');
		$$invalidate(0, showFavourites = false);
		$$invalidate(8, hasSelection = false);
		$$invalidate(1, remoteResults = []);
		$$invalidate(7, open = query.trim().length > 0);

		if (!composing && query.trim().length >= 3) $$invalidate(9, searchTimer = setTimeout(
			() => {
				$$invalidate(9, searchTimer = null);
				void runSearch();
			},
			450
		));
	}

	async function runSearch() {
		const searchText = query.trim();
		if (searchText.length < 3 || composing) return;
		if (searchTimer) clearTimeout(searchTimer);
		$$invalidate(9, searchTimer = null);
		const id = ++requestId;
		controller?.abort();
		controller = new AbortController();
		$$invalidate(3, searching = true);
		$$invalidate(4, hasSearched = true);
		$$invalidate(7, open = true);

		try {
			const places = await autocompletePlaces(searchText, controller.signal);
			if (id === requestId) $$invalidate(1, remoteResults = places);
		} catch(error) {
			if (error?.name !== 'AbortError' && id === requestId) $$invalidate(6, locationError = 'Place search unavailable. Try again or tap the map.');
			if (id === requestId) $$invalidate(1, remoteResults = []);
		} finally {
			if (id === requestId) $$invalidate(3, searching = false);
		}
	}

	function submitSearch() {
		if (searching || composing) return;
		if (visibleResults.length === 1 && (showFavourites || remoteResults.length)) chooseResult(visibleResults[0]); else void runSearch();
	}

	function toggleFavourites() {
		clearPendingSearch();
		$$invalidate(2, query = '');
		$$invalidate(6, locationError = '');
		$$invalidate(0, showFavourites = !showFavourites);
		$$invalidate(7, open = showFavourites);
		$$invalidate(1, remoteResults = []);
	}

	function chooseResult(result) {
		clearPendingSearch();
		$$invalidate(2, query = '');
		$$invalidate(6, locationError = '');
		$$invalidate(7, open = false);
		$$invalidate(0, showFavourites = false);
		$$invalidate(8, hasSelection = true);
		$$invalidate(1, remoteResults = []);
		dispatch('select', result);
	}

	function handleKeydown(event) {
		event.stopPropagation();

		if (event.key === 'Escape' && open) {
			event.preventDefault();
			clearPendingSearch();
			$$invalidate(7, open = false);
			$$invalidate(0, showFavourites = false);
		}
	}

	function handleFavouritesChanged() {
		loadFavourites();
	}

	onMount(() => {
		loadFavourites();
		window.addEventListener(FAVOURITES_CHANGED_EVENT$1, handleFavouritesChanged);
	});

	onDestroy(() => {
		clearPendingSearch();
		window.removeEventListener(FAVOURITES_CHANGED_EVENT$1, handleFavouritesChanged);
	});

	function keyup_handler(event) {
		bubble.call(this, $$self, event);
	}

	function input_input_handler() {
		query = this.value;
		$$invalidate(2, query);
	}

	const focus_handler = () => {
		if (query.trim()) $$invalidate(7, open = true);
	};

	const compositionstart_handler = () => {
		$$invalidate(10, composing = true);
		clearPendingSearch();
	};

	const compositionend_handler = () => {
		$$invalidate(10, composing = false);
		scheduleSearch();
	};

	const click_handler = result => chooseResult(result);
	const click_handler_1 = result => toggleFavourite(result);

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*showFavourites, favourites, remoteResults*/ 4194307) {
			$$invalidate(11, visibleResults = showFavourites ? favourites : remoteResults);
		}
	};

	return [
		showFavourites,
		remoteResults,
		query,
		searching,
		hasSearched,
		locating,
		locationError,
		open,
		hasSelection,
		searchTimer,
		composing,
		visibleResults,
		isFavourite,
		toggleFavourite,
		clearPendingSearch,
		clearSearch,
		useCurrentLocation,
		scheduleSearch,
		submitSearch,
		toggleFavourites,
		chooseResult,
		handleKeydown,
		favourites,
		keyup_handler,
		input_input_handler,
		focus_handler,
		compositionstart_handler,
		compositionend_handler,
		click_handler,
		click_handler_1
	];
}

class PlaceSearch extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, add_css$4, [-1, -1]);
	}
}

const config = {
    name: 'windy-plugin-snowline-map-100m',
    version: '1000.0.5'};

const UNITS_STORAGE_KEY = 'wintry:units:v1';
function loadUnitSystem() {
    try {
        return localStorage.getItem(UNITS_STORAGE_KEY) === 'imperial' ? 'imperial' : 'metric';
    } catch  {
        return 'metric';
    }
}
function saveUnitSystem(units) {
    try {
        localStorage.setItem(UNITS_STORAGE_KEY, units);
    } catch  {}
}
function metresToFeet(m) {
    return m * 3.280839895;
}
function cmToInches(cm) {
    return cm / 2.54;
}
function mmToInches(mm) {
    return mm / 25.4;
}
function cToF(c) {
    return c * 9 / 5 + 32;
}
function formatElevation(m, units, stepM = 10) {
    if (m === null || !Number.isFinite(m)) return '—';
    if (units === 'imperial') return `${Math.round(metresToFeet(m) / 50) * 50} ft`;
    return `${Math.round(m / stepM) * stepM} m`;
}
function formatSnow(cm, units) {
    if (cm === null || !Number.isFinite(cm)) return '—';
    if (cm < 0.05) return 'None';
    if (units === 'imperial') {
        const value = cmToInches(cm);
        return value < 4 ? `${value.toFixed(1).replace(/\.0$/, '')} in` : `${Math.round(value)} in`;
    }
    return cm < 10 ? `${cm.toFixed(1).replace(/\.0$/, '')} cm` : `${Math.round(cm)} cm`;
}
function formatPrecip(mm3h, units) {
    if (mm3h === null || !Number.isFinite(mm3h)) return '—';
    const hourly = mm3h;
    if (units === 'imperial') {
        const value = mmToInches(hourly);
        return `${value < 0.1 ? value.toFixed(2) : value.toFixed(1)} in/3h`;
    }
    return `${hourly < 10 ? hourly.toFixed(2).replace(/\.?0+$/, '') : Math.round(hourly)} mm/3h`;
}
function formatTemperature(c, units, digits = 1) {
    if (c === null || !Number.isFinite(c)) return '—';
    const value = units === 'imperial' ? cToF(c) : c;
    return `${value.toFixed(digits)}°${units === 'imperial' ? 'F' : 'C'}`;
}

/* src\V21Panel.svelte generated by Svelte v4.2.20 */

function add_css$3(target) {
	append_styles(target, "svelte-ip90yw", ".release-row.svelte-ip90yw.svelte-ip90yw{display:flex;justify-content:space-between;margin-top:4px;color:#a8b6bf;font-size:9px;line-height:12px}.v21-panel.svelte-ip90yw.svelte-ip90yw{margin-top:5px}.meta-row.svelte-ip90yw.svelte-ip90yw{display:flex;align-items:center;justify-content:space-between;gap:4px}.units.svelte-ip90yw.svelte-ip90yw{display:flex;flex-shrink:0;overflow:hidden;border:1px solid rgba(255, 255, 255, 0.12);border-radius:6px}.units.svelte-ip90yw button.svelte-ip90yw{height:26px;padding:0 4px;border:0;background:rgba(255, 255, 255, 0.04);color:#a8b6bf;font-size:9px;font-weight:800;cursor:pointer}.units.svelte-ip90yw button.active.svelte-ip90yw{background:rgba(80, 190, 255, 0.16);color:#dff7ff}.freshness.svelte-ip90yw.svelte-ip90yw{min-width:0;overflow:hidden;text-overflow:ellipsis;color:#a8b6bf;font-size:9px;font-weight:700;white-space:nowrap}.units.svelte-ip90yw button.svelte-ip90yw{height:32px;font-size:11px;padding:0 7px}.freshness.svelte-ip90yw.svelte-ip90yw{font-size:11px}.release-row.svelte-ip90yw.svelte-ip90yw{font-size:10px;margin-top:6px}");
}

function create_fragment$4(ctx) {
	let div3;
	let div1;
	let div0;
	let button0;
	let t0;
	let button0_aria_pressed_value;
	let t1;
	let button1;
	let t2;
	let button1_aria_pressed_value;
	let t3;
	let span0;
	let t4;
	let t5;
	let div2;
	let span1;
	let mounted;
	let dispose;

	return {
		c() {
			div3 = element("div");
			div1 = element("div");
			div0 = element("div");
			button0 = element("button");
			t0 = text("Metric");
			t1 = space();
			button1 = element("button");
			t2 = text("Imperial");
			t3 = space();
			span0 = element("span");
			t4 = text(/*freshnessLabel*/ ctx[1]);
			t5 = space();
			div2 = element("div");
			span1 = element("span");
			span1.textContent = `v${config.version}`;
			attr(button0, "type", "button");
			attr(button0, "aria-pressed", button0_aria_pressed_value = /*unitSystem*/ ctx[0] === 'metric');
			attr(button0, "class", "svelte-ip90yw");
			toggle_class(button0, "active", /*unitSystem*/ ctx[0] === 'metric');
			attr(button1, "type", "button");
			attr(button1, "aria-pressed", button1_aria_pressed_value = /*unitSystem*/ ctx[0] === 'imperial');
			attr(button1, "class", "svelte-ip90yw");
			toggle_class(button1, "active", /*unitSystem*/ ctx[0] === 'imperial');
			attr(div0, "class", "units svelte-ip90yw");
			attr(div0, "role", "group");
			attr(div0, "aria-label", "Display units");
			attr(span0, "class", "freshness svelte-ip90yw");
			attr(span0, "title", /*freshnessLabel*/ ctx[1]);
			attr(div1, "class", "meta-row svelte-ip90yw");
			attr(span1, "title", "Plugin version");
			attr(div2, "class", "release-row svelte-ip90yw");
			attr(div3, "class", "v21-panel svelte-ip90yw");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div1);
			append(div1, div0);
			append(div0, button0);
			append(button0, t0);
			append(div0, t1);
			append(div0, button1);
			append(button1, t2);
			append(div1, t3);
			append(div1, span0);
			append(span0, t4);
			append(div3, t5);
			append(div3, div2);
			append(div2, span1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler*/ ctx[5]),
					listen(button1, "click", /*click_handler_1*/ ctx[6])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*unitSystem*/ 1 && button0_aria_pressed_value !== (button0_aria_pressed_value = /*unitSystem*/ ctx[0] === 'metric')) {
				attr(button0, "aria-pressed", button0_aria_pressed_value);
			}

			if (dirty & /*unitSystem*/ 1) {
				toggle_class(button0, "active", /*unitSystem*/ ctx[0] === 'metric');
			}

			if (dirty & /*unitSystem*/ 1 && button1_aria_pressed_value !== (button1_aria_pressed_value = /*unitSystem*/ ctx[0] === 'imperial')) {
				attr(button1, "aria-pressed", button1_aria_pressed_value);
			}

			if (dirty & /*unitSystem*/ 1) {
				toggle_class(button1, "active", /*unitSystem*/ ctx[0] === 'imperial');
			}

			if (dirty & /*freshnessLabel*/ 2) set_data(t4, /*freshnessLabel*/ ctx[1]);

			if (dirty & /*freshnessLabel*/ 2) {
				attr(span0, "title", /*freshnessLabel*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div3);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

function runFreshness(run, reference) {
	if (run === null || !Number.isFinite(run)) return 'ECMWF';
	const d = new Date(run);
	const cycle = `${String(d.getUTCHours()).padStart(2, '0')}Z`;
	const age = Math.max(0, (reference - run) / 3600_000);
	return `ECMWF ${cycle} · ${age < 1 ? '<1 h' : `${Math.round(age)} h`}`;
}

function instance$4($$self, $$props, $$invalidate) {
	let freshnessLabel;
	let { unitSystem = 'metric' } = $$props;
	let { activeRunTime = null } = $$props;
	let now = Date.now();
	let timer = null;

	function setUnits(value) {
		$$invalidate(0, unitSystem = value);
		saveUnitSystem(value);
	}

	onMount(() => {
		timer = setInterval(() => $$invalidate(4, now = Date.now()), 60_000);

		return () => {
			if (timer) clearInterval(timer);
		};
	});

	const click_handler = () => setUnits('metric');
	const click_handler_1 = () => setUnits('imperial');

	$$self.$$set = $$props => {
		if ('unitSystem' in $$props) $$invalidate(0, unitSystem = $$props.unitSystem);
		if ('activeRunTime' in $$props) $$invalidate(3, activeRunTime = $$props.activeRunTime);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*activeRunTime, now*/ 24) {
			$$invalidate(1, freshnessLabel = runFreshness(activeRunTime, now));
		}
	};

	return [
		unitSystem,
		freshnessLabel,
		setUnits,
		activeRunTime,
		now,
		click_handler,
		click_handler_1
	];
}

class V21Panel extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { unitSystem: 0, activeRunTime: 3 }, add_css$3);
	}
}

const PRESSURE_LEVELS = [
    '1000h',
    '950h',
    '925h',
    '900h',
    '850h',
    '800h',
    '700h',
    '600h',
    '500h',
    '400h',
    '300h',
    '250h',
    '200h',
    '150h'
];
const DEFAULT_COLD_COLUMN_LAPSE_C_PER_M = -6e-3;
const MIN_COLD_COLUMN_GRADIENT_C_PER_M = -0.012;
const MAX_COLD_COLUMN_GRADIENT_C_PER_M = -1e-3;
/** Magnus saturation vapour pressure, hPa. */ function saturationVapourPressure$1(tempC) {
    return 6.112 * Math.exp(17.67 * tempC / (tempC + 243.5));
}
/**
 * Pressure-aware wet-bulb temperature from dry-bulb T, dew point Td and pressure.
 *
 * Solves the ventilated-psychrometer relation:
 * e(Td) = es(Tw) - A(Tw) * p * (T - Tw)
 *
 * using bisection between Td and T.
 */ function wetBulbFromDewpoint(tempC, dewpointC, pressureHpa) {
    const td = Math.min(tempC, dewpointC);
    const e = saturationVapourPressure$1(td);
    const f = (tw)=>{
        const A = 0.00066 * (1 + 0.00115 * tw);
        return saturationVapourPressure$1(tw) - A * pressureHpa * (tempC - tw) - e;
    };
    let lo = Math.min(td, tempC);
    let hi = Math.max(td, tempC);
    // In saturated air Tw ~= T.
    if (Math.abs(hi - lo) < 1e-6) return tempC;
    let flo = f(lo);
    let fhi = f(hi);
    // Defensive fallback if numerical bracketing is imperfect.
    if (!(flo <= 0 && fhi >= 0)) {
        lo = Math.min(td - 15, tempC - 30);
        hi = tempC;
        flo = f(lo);
        fhi = f(hi);
    }
    for(let n = 0; n < 60; n++){
        const mid = 0.5 * (lo + hi);
        const fm = f(mid);
        if (Math.abs(fm) < 1e-5) return mid;
        if (fm > 0) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    return 0.5 * (lo + hi);
}
/**
 * Keep the operational snowline field continuous when every resolved level is
 * already below 0 C wet-bulb temperature. The physical result is still
 * "below the lowest resolved level"; this finite value is a bounded downward
 * extrapolation for mapping, interpolation and terrain comparisons.
 */ function coldColumnSnowLevel(profile) {
    const lowest = profile[0];
    let gradient = DEFAULT_COLD_COLUMN_LAPSE_C_PER_M;
    for(let i = 1; i < profile.length; i++){
        const dz = profile[i].heightM - lowest.heightM;
        if (dz <= 50) continue;
        const candidate = (profile[i].wetBulbC - lowest.wetBulbC) / dz;
        if (Number.isFinite(candidate) && candidate >= MIN_COLD_COLUMN_GRADIENT_C_PER_M && candidate <= MAX_COLD_COLUMN_GRADIENT_C_PER_M) {
            gradient = candidate;
            break;
        }
    }
    const rawDz = (0 - lowest.wetBulbC) / gradient;
    const dz = Math.max(-4e3, Math.min(-1, rawDz));
    return lowest.heightM + dz;
}
/** Atmospheric WBZ estimate, retained for comparison with local map terrain.
 * A crossing below local terrain is a model-profile diagnostic, not local air.
 */ function wetBulbZeroHeight(profile) {
    const p = profile.filter((v)=>Number.isFinite(v.heightM) && Number.isFinite(v.wetBulbC)).sort((a, b)=>a.heightM - b.heightM);
    if (!p.length) return {
        snowLevelM: null,
        status: 'insufficient-profile'
    };
    if (p[0].wetBulbC === 0) {
        return {
            snowLevelM: p[0].heightM,
            status: 'resolved',
            lower: p[0],
            upper: p[0]
        };
    }
    // In an already-cold lowest level the true WBZ is below the resolved
    // profile. Retain that status, but provide a bounded operational estimate so
    // the map, chart and terrain comparison do not develop artificial gaps.
    if (p[0].wetBulbC < 0) {
        return {
            snowLevelM: coldColumnSnowLevel(p),
            status: 'below-lowest-level',
            upperBoundM: p[0].heightM,
            belowLowestLevel: true,
            extrapolated: true
        };
    }
    if (p.length < 2) return {
        snowLevelM: null,
        status: 'insufficient-profile'
    };
    for(let i = 0; i < p.length - 1; i++){
        const lower = p[i];
        const upper = p[i + 1];
        if (upper.heightM > lower.heightM && lower.wetBulbC > 0 && upper.wetBulbC <= 0) {
            const fraction = (0 - lower.wetBulbC) / (upper.wetBulbC - lower.wetBulbC);
            return {
                snowLevelM: lower.heightM + fraction * (upper.heightM - lower.heightM),
                lower,
                upper,
                belowLowestLevel: false,
                status: 'resolved'
            };
        }
    }
    return {
        snowLevelM: null,
        status: 'no-crossing'
    };
}
function buildProfile(data, timeIndex) {
    const profile = [];
    for (const level of PRESSURE_LEVELS){
        const t = valueAt(data[`temp-${level}`], timeIndex);
        const td = valueAt(data[`dewpoint-${level}`], timeIndex);
        const gh = valueAt(data[`gh-${level}`], timeIndex);
        if (t === null || td === null || gh === null) continue;
        const tempC = t > 150 ? t - 273.15 : t;
        const dewpointC = td > 150 ? td - 273.15 : td;
        const pressureHpa = Number(level.replace('h', ''));
        /*
     * Windy's meteogram `gh-*` values are geopotential HEIGHT.
     * Live values are on the normal metre scale (e.g. ~4 km at 600 hPa),
     * so do NOT divide by g.
     */ const heightM = gh;
        profile.push({
            level,
            pressureHpa,
            heightM,
            tempC,
            dewpointC,
            wetBulbC: wetBulbFromDewpoint(tempC, dewpointC, pressureHpa)
        });
    }
    return profile.sort((a, b)=>a.heightM - b.heightM);
}
/** Accept Arrays, TypedArrays, generic array-like values and scalars. */ function valueAt(value, i) {
    if (value == null) return null;
    let x;
    if (Array.isArray(value)) {
        x = value[i];
    } else if (ArrayBuffer.isView(value)) {
        x = value[i];
    } else if (typeof value === 'object' && 'length' in value) {
        x = value[i];
    } else if (typeof value === 'number' && i === 0) {
        x = value;
    } else {
        return null;
    }
    if (typeof x === 'number' && Number.isFinite(x)) return x;
    if (typeof x === 'string' && x.trim() !== '') {
        const n = Number(x);
        if (Number.isFinite(n)) return n;
    }
    return null;
}

/**
 * Windy's precipitation feed used by this plugin is normalized onto a 3-hour
 * accumulation-equivalent basis internally. Prefer the explicit past-3-hour field and
 * keep the returned value as a 3-hour-equivalent amount rather than presenting
 * it internally as an hourly rate.
 */ const EXACT_KEYS = [
    'past3hprecip-surface',
    'past1hprecip-surface',
    'precip-surface',
    'rain-surface',
    'precipitation-surface',
    'precipitation',
    'precip',
    'rain',
    'tp'
];
const METRE_WATER_KEYS = new Set([
    'past3hprecip-surface',
    'past1hprecip-surface'
]);
/** Minimum normalized 3-hour-equivalent amount used for ptype diagnosis. */ const PRECIP_THRESHOLD_MM_3H = 0.1;
/** @deprecated Use PRECIP_THRESHOLD_MM_3H; retained for source compatibility. */ const PRECIP_THRESHOLD_MM_H = PRECIP_THRESHOLD_MM_3H;
const precipFieldCache = new WeakMap();
function normalizedKey(key) {
    return key.toLowerCase().replace(/[_\s]/g, '-');
}
function isPrecipKey$1(key) {
    const normalized = normalizedKey(key);
    if (EXACT_KEYS.includes(normalized)) return true;
    return (normalized.includes('precip') || normalized === 'rain' || normalized.startsWith('rain-') || normalized === 'tp') && !normalized.includes('type') && !normalized.includes('snow');
}
function looksArrayLike(value) {
    if (Array.isArray(value)) return value.length > 0;
    if (ArrayBuffer.isView(value)) return Number(value?.length) > 0;
    return !!value && typeof value === 'object' && Number.isFinite(Number(value?.length));
}
function findPrecipFieldUncached(value, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 5) return null;
    const object = value;
    for (const wanted of EXACT_KEYS){
        for (const [key, field] of Object.entries(object)){
            if (normalizedKey(key) === wanted && looksArrayLike(field)) return {
                key,
                field
            };
        }
    }
    // Compatibility fallback for unfamiliar precipitation aliases. Windy's
    // displayed precipitation values are treated as 3-hour-equivalent amounts.
    for (const [key, field] of Object.entries(object)){
        if (isPrecipKey$1(key) && looksArrayLike(field)) return {
            key,
            field
        };
    }
    for (const child of Object.values(object)){
        if (child && typeof child === 'object' && !looksArrayLike(child)) {
            const found = findPrecipFieldUncached(child, depth + 1);
            if (found) return found;
        }
    }
    return null;
}
function findPrecipField(data) {
    const cached = precipFieldCache.get(data);
    if (cached !== undefined) return cached;
    const found = findPrecipFieldUncached(data);
    precipFieldCache.set(data, found);
    return found;
}
function toThreeHourlyMillimetres(key, raw) {
    const normalized = normalizedKey(key);
    const millimetres = METRE_WATER_KEYS.has(normalized) ? raw * 1000 : raw;
    // If only Windy's explicit one-hour field is available, convert it to a
    // three-hour-equivalent amount so the rest of the UI keeps one unit.
    return normalized === 'past1hprecip-surface' ? millimetres * 3 : millimetres;
}
/** Precipitation amount in millimetres per 3-hour-equivalent period. */ function precipMmAt(data, index) {
    if ('__precipMm3h' in data) return valueAt(data.__precipMm3h, index);
    const found = findPrecipField(data);
    if (!found) return null;
    const raw = valueAt(found.field, index);
    if (raw === null || !Number.isFinite(raw)) return null;
    return Math.max(0, toThreeHourlyMillimetres(found.key, raw));
}

/** Qualify a model estimate without discarding its best-supported phase. */ function precipitationLabel(phase, confidence = phase.confidence) {
    return confidence === 'low' ? `${phase.label} possible` : phase.label;
}
const WARM_NODE_C = 0.2;
const MIN_MELTING_DM = 150;
const PARTIAL_MELTING_DM = 500;
const FULL_MELTING_DM = 1100;
const ICE_PELLET_REFREEZE_DM = 800;
const MAX_ANALYSIS_DEPTH_M = 5500;
function interpolateAtHeight(a, b, heightM) {
    const dz = b.heightM - a.heightM;
    const f = Math.abs(dz) < 1e-6 ? 0 : (heightM - a.heightM) / dz;
    const lerp = (x, y)=>x + f * (y - x);
    const logP = lerp(Math.log(a.pressureHpa), Math.log(b.pressureHpa));
    return {
        level: a.level,
        pressureHpa: Math.exp(logP),
        heightM,
        tempC: lerp(a.tempC, b.tempC),
        dewpointC: lerp(a.dewpointC, b.dewpointC),
        wetBulbC: lerp(a.wetBulbC, b.wetBulbC)
    };
}
function terrainProfile(profile, terrainM) {
    const p = profile.filter((v)=>Number.isFinite(v.heightM) && Number.isFinite(v.wetBulbC)).sort((a, b)=>a.heightM - b.heightM);
    if (p.length < 2 || !Number.isFinite(terrainM)) return null;
    if (terrainM > p[p.length - 1].heightM) return null;
    let surface;
    let extrapolated = false;
    let start = 0;
    if (terrainM <= p[0].heightM) {
        surface = {
            ...p[0],
            heightM: terrainM
        };
        extrapolated = true;
    } else {
        let bracket = -1;
        for(let i = 0; i < p.length - 1; i++){
            if (terrainM >= p[i].heightM && terrainM <= p[i + 1].heightM) {
                bracket = i;
                break;
            }
        }
        if (bracket < 0) return null;
        surface = interpolateAtHeight(p[bracket], p[bracket + 1], terrainM);
        start = bracket + 1;
    }
    const top = terrainM + MAX_ANALYSIS_DEPTH_M;
    const points = [
        surface,
        ...p.slice(start).filter((v)=>v.heightM > terrainM + 1 && v.heightM <= top)
    ];
    if (points.length < 2) return null;
    return {
        points,
        extrapolated
    };
}
function integrateSigned(points, sign, ceilingM = Infinity) {
    let sum = 0;
    for(let i = 0; i < points.length - 1; i++){
        const a = points[i];
        const b = points[i + 1];
        if (a.heightM >= ceilingM) break;
        const upper = Math.min(b.heightM, ceilingM);
        if (upper <= a.heightM) continue;
        const fraction = (upper - a.heightM) / Math.max(1e-6, b.heightM - a.heightM);
        const twB = a.wetBulbC + fraction * (b.wetBulbC - a.wetBulbC);
        const fa = sign === 'positive' ? Math.max(0, a.wetBulbC) : Math.max(0, -a.wetBulbC);
        const fb = sign === 'positive' ? Math.max(0, twB) : Math.max(0, -twB);
        // A layer crossing zero contributes only on the selected side of the crossing.
        const signedFraction = a.wetBulbC * twB < 0 ? (fa > 0 ? Math.abs(a.wetBulbC) : Math.abs(twB)) / (Math.abs(a.wetBulbC) + Math.abs(twB)) : 1;
        sum += 0.5 * (fa + fb) * (upper - a.heightM) * signedFraction;
    }
    return sum;
}
function classifyConfidence(points, extrapolated, warmDM, coldDM) {
    if (extrapolated) return 'low';
    let maxGap = 0;
    for(let i = 1; i < points.length; i++)maxGap = Math.max(maxGap, points[i].heightM - points[i - 1].heightM);
    if (maxGap > 1400) return 'low';
    const near = (value, threshold, margin)=>Math.abs(value - threshold) <= margin;
    if (near(warmDM, MIN_MELTING_DM, 90) || near(warmDM, PARTIAL_MELTING_DM, 180) || near(warmDM, FULL_MELTING_DM, 260) || near(coldDM, ICE_PELLET_REFREEZE_DM, 220)) return 'medium';
    return maxGap <= 850 ? 'high' : 'medium';
}
function result(key, label, icon, detail, confidence, surfaceWetBulbC, meltingDegreeMetres, refreezingDegreeMetres) {
    return {
        key,
        label,
        icon,
        detail,
        confidence,
        surfaceWetBulbC,
        meltingDegreeMetres,
        refreezingDegreeMetres
    };
}
/** Terrain-aware precipitation type from the wet-bulb vertical profile. */ function terrainPrecipitationType(profile, terrainM) {
    const prepared = terrainProfile(profile, terrainM);
    if (!prepared) return null;
    const points = prepared.points;
    const surfaceTw = points[0].wetBulbC;
    const warmPoints = points.filter((v)=>v.wetBulbC > WARM_NODE_C);
    const warmBottom = warmPoints.length ? Math.min(...warmPoints.map((v)=>v.heightM)) : Infinity;
    const warmDM = integrateSigned(points, 'positive');
    const coldDM = Number.isFinite(warmBottom) ? integrateSigned(points, 'negative', warmBottom) : integrateSigned(points, 'negative');
    const confidence = classifyConfidence(points, prepared.extrapolated, warmDM, coldDM);
    const approximate = confidence === 'low' ? '~ ' : '';
    if (warmDM < MIN_MELTING_DM) {
        if (surfaceTw <= -0.7) return result('snow', 'Snow', '❄', `${approximate}Cold column`, confidence, surfaceTw, warmDM, coldDM);
        if (surfaceTw <= 0.6) return result('wet-snow', 'Wet snow', '❄', `${approximate}Near-melting snow`, confidence, surfaceTw, warmDM, coldDM);
        return result('mix', 'Rain / snow mix', '🌨', `${approximate}Marginal melting near terrain`, confidence, surfaceTw, warmDM, coldDM);
    }
    if (warmDM < PARTIAL_MELTING_DM) {
        if (surfaceTw <= 0.3) return result('wet-snow', 'Wet snow', '❄', `${approximate}Partial melting`, confidence, surfaceTw, warmDM, coldDM);
        return result('mix', 'Rain / snow mix', '🌨', `${approximate}Partial melting`, confidence, surfaceTw, warmDM, coldDM);
    }
    if (surfaceTw <= 0 && warmDM >= PARTIAL_MELTING_DM) {
        if (coldDM >= ICE_PELLET_REFREEZE_DM) {
            return result('ice-pellets', 'Ice pellets', '🧊', `${approximate}Warm layer aloft · refreezing below`, confidence, surfaceTw, warmDM, coldDM);
        }
        return result('freezing-rain', 'Freezing rain', '⚠', `${approximate}Melted aloft · shallow surface cold layer`, confidence, surfaceTw, warmDM, coldDM);
    }
    if (warmDM < FULL_MELTING_DM && surfaceTw <= 1.2) {
        return result('mix', 'Rain / snow mix', '🌨', `${approximate}Incomplete melting`, confidence, surfaceTw, warmDM, coldDM);
    }
    return result('rain', 'Rain', '🌧', `${approximate}Melted before reaching terrain`, confidence, surfaceTw, warmDM, coldDM);
}

const HOUR_MS = 3600_000;
/** Profile timestamps represent interval starts, never the nearest future slot. */ function forecastIntervalHours(times, index) {
    if (index < 0 || index >= times.length) return 0;
    const difference = index + 1 < times.length ? times[index + 1] - times[index] : index > 0 ? times[index] - times[index - 1] : 3 * HOUR_MS;
    return Number.isFinite(difference) && difference > 0 ? Math.min(3, difference / HOUR_MS) : 0;
}
function forecastIntervalIndex(times, target) {
    if (!Number.isFinite(target)) return -1;
    for(let i = times.length - 1; i >= 0; i--){
        if (times[i] <= target) {
            return target < times[i] + forecastIntervalHours(times, i) * HOUR_MS ? i : -1;
        }
    }
    return -1;
}

function snowlineAt(point, index, terrainM) {
    try {
        const result = wetBulbZeroHeight(buildProfile(point.forecast, index));
        return result.snowLevelM !== null && Number.isFinite(result.snowLevelM) ? result.snowLevelM : null;
    } catch  {
        return null;
    }
}
function formatLead(hours) {
    const rounded = Math.max(0, Math.round(hours));
    if (rounded < 24) return `${rounded} h`;
    const days = Math.floor(rounded / 24);
    const remainder = rounded % 24;
    return remainder ? `${days}d ${remainder}h` : `${days}d`;
}
function formatUtc(time) {
    const date = new Date(time);
    const day = date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    });
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day} ${hour}:${minute} UTC`;
}
function interpolateCrossingTime(beforeTime, afterTime, beforeSnowline, afterSnowline, terrainM) {
    const denominator = afterSnowline - beforeSnowline;
    if (Math.abs(denominator) < 1e-6) return afterTime;
    const fraction = Math.max(0, Math.min(1, (terrainM - beforeSnowline) / denominator));
    return beforeTime + fraction * (afterTime - beforeTime);
}
function terrainCrossingState(point, terrainM, targetTime) {
    if (!point || !Array.isArray(point.times) || !point.times.length || terrainM === null || !Number.isFinite(terrainM)) return null;
    const startIndex = forecastIntervalIndex(point.times, targetTime);
    if (startIndex < 0) return null;
    const current = snowlineAt(point, startIndex);
    const unresolved = {
        summary: 'Terrain crossing unresolved',
        detail: 'The atmospheric profile does not resolve WBZ at every required time; no crossing time is inferred across gaps.',
        crossingIndex: null,
        crossingTime: null,
        direction: 'none'
    };
    if (current === null) return unresolved;
    let currentBelowTerrain = current <= terrainM;
    let previousIndex = startIndex;
    let previousValue = current;
    for(let i = startIndex + 1; i < point.times.length; i++){
        if (point.times[i] > point.times[0] + 144 * 3600_000) break;
        if (point.times[i] - point.times[previousIndex] > 3 * 3600_000) return unresolved;
        const value = snowlineAt(point, i);
        if (value === null) return unresolved;
        const belowTerrain = value <= terrainM;
        if (belowTerrain !== currentBelowTerrain) {
            const crossingTime = interpolateCrossingTime(point.times[previousIndex], point.times[i], previousValue, value, terrainM);
            if (crossingTime < targetTime) {
                currentBelowTerrain = belowTerrain;
                previousIndex = i;
                previousValue = value;
                continue;
            }
            const leadHours = (crossingTime - targetTime) / 3600_000;
            if (belowTerrain) {
                return {
                    summary: `Snowline below terrain in ${formatLead(leadHours)}`,
                    detail: `Thermal snowline falls below local terrain around ${formatUtc(crossingTime)}; precipitation is still required for snowfall`,
                    crossingIndex: i,
                    crossingTime,
                    direction: 'below'
                };
            }
            return {
                summary: `Snowline above terrain in ${formatLead(leadHours)}`,
                detail: `Thermal snowline rises above local terrain around ${formatUtc(crossingTime)}`,
                crossingIndex: i,
                crossingTime,
                direction: 'above'
            };
        }
        previousIndex = i;
        previousValue = value;
    }
    return currentBelowTerrain ? {
        summary: 'Snowline below terrain in the available forecast',
        detail: 'Thermal snowline remains below local terrain in the available forecast; precipitation is still required for snowfall',
        crossingIndex: null,
        crossingTime: null,
        direction: 'none'
    } : {
        summary: 'Snowline above terrain in the available forecast',
        detail: 'Thermal snowline remains above local terrain in the available forecast',
        crossingIndex: null,
        crossingTime: null,
        direction: 'none'
    };
}

/**
 * Estimate forecast-created NEW snow depth.
 *
 * This is intentionally not total lying snow depth. It starts from zero and
 * converts forecast liquid precipitation into a terrain-aware fresh-snow
 * estimate, then applies simple settling and melt to that forecast-created
 * layer. The result should be treated as guidance, not model snow depth.
 *
 * Precipitation is supplied as a 3-hour-equivalent liquid amount (mm/3h).
 * Callers pass the represented forecast interval in hours; the conversion
 * scales the liquid amount by dt/3 so hourly and 3-hourly sampling integrate
 * consistently.
 */ function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Fresh-snow ratio for the snow portion of the precipitation.
 *
 * SLR is kept separate from precipitation phase fraction so mixed/wet snow is
 * not penalised twice.
 */ function snowToLiquidRatio(phase) {
    const tw = phase.surfaceWetBulbC;
    if (phase.key === 'snow') {
        if (tw <= -8) return 18;
        if (tw <= -5) return 15;
        if (tw <= -3) return 12;
        if (tw <= -1) return 9;
        return 7;
    }
    if (phase.key === 'wet-snow') {
        if (tw <= -0.5) return 7.5;
        if (tw <= 0.2) return 6;
        return 4.5;
    }
    // For a rain/snow mix this is the ratio of the snow component only. The
    // amount assigned to that component is handled separately below.
    if (phase.key === 'mix') return 6;
    // Ice pellets are wintry precipitation, but they are not "new snow".
    return 0;
}
/** Fraction of liquid-equivalent precipitation represented by falling snow. */ function snowFraction(phase) {
    const tw = phase.surfaceWetBulbC;
    if (phase.key === 'snow') return 1;
    if (phase.key === 'wet-snow') {
        if (tw <= 0) return 0.95;
        if (tw <= 0.6) return 0.85;
        return 0.75;
    }
    if (phase.key === 'mix') {
        // Use the diagnosed positive wet-bulb energy to vary the snow share. A
        // shallow/weak warm layer retains more snow than a nearly fully melting
        // profile.
        const warmDM = Math.max(0, phase.meltingDegreeMetres);
        const fraction = 0.65 - 0.50 * clamp((warmDM - 150) / (1100 - 150), 0, 1);
        const surfaceAdjustment = tw > 0.8 ? 0.85 : 1;
        return clamp(fraction * surfaceAdjustment, 0.10, 0.65);
    }
    // Ice pellets, freezing rain and rain do not contribute to NEW SNOW depth.
    return 0;
}
function estimateNewSnowStep(precipMm3h, phase, previousCm, hours = 1) {
    const dt = Number.isFinite(hours) ? Math.max(0, Math.min(6, hours)) : 0;
    if (dt === 0) return {
        hourlyCm: 0,
        cumulativeCm: Math.max(0, previousCm)
    };
    let snowpack = Math.max(0, previousCm);
    if (!phase) {
        snowpack *= Math.pow(0.997, dt);
        return {
            hourlyCm: 0,
            cumulativeCm: snowpack
        };
    }
    const tw = phase.surfaceWetBulbC;
    // Fresh snow compacts fastest near the melting point and more slowly in a
    // colder boundary layer. This is deliberately modest because the plugin has
    // no full snowpack-energy model.
    const settlePerHour = tw >= -0.5 ? 0.010 : tw >= -3 ? 0.006 : 0.003;
    snowpack *= Math.pow(1 - settlePerHour, dt);
    // Simple temperature-dependent melt of forecast-created snow. This is not a
    // substitute for a surface-energy-balance snow model, so keep it bounded.
    if (tw > 0) {
        const meltCmH = Math.min(1.8, 0.18 + 0.22 * tw);
        snowpack = Math.max(0, snowpack - meltCmH * dt);
    }
    if (precipMm3h === null || !Number.isFinite(precipMm3h) || precipMm3h <= 0) {
        return {
            hourlyCm: 0,
            cumulativeCm: snowpack
        };
    }
    const slr = snowToLiquidRatio(phase);
    const fraction = snowFraction(phase);
    if (slr <= 0 || fraction <= 0) {
        return {
            hourlyCm: 0,
            cumulativeCm: snowpack
        };
    }
    // precipMm3h is a 3-hour-equivalent amount. Convert it to the represented
    // forecast interval before applying the snow ratio and snow fraction.
    const liquidMm = Math.max(0, precipMm3h) * (dt / 3);
    const addedCm = liquidMm * slr * fraction / 10;
    snowpack += addedCm;
    return {
        hourlyCm: addedCm / dt,
        cumulativeCm: snowpack
    };
}

const MAX_EVENT_GAP_HOURS = 3;
const WINTRY_KEYS = new Set([
    'snow',
    'wet-snow',
    'mix',
    'ice-pellets',
    'freezing-rain'
]);
const CONFIDENCE_SCORE = {
    low: 1,
    medium: 2,
    high: 3
};
function diagnosedPhase(point, index, terrainM) {
    const precip = precipMmAt(point.forecast, index);
    if (precip === null || precip < PRECIP_THRESHOLD_MM_H) return null;
    return terrainPrecipitationType(buildProfile(point.forecast, index), terrainM);
}
function aggregateConfidence(event) {
    let weight = 0;
    let score = 0;
    let lowWeight = 0;
    for (const step of event){
        const w = Math.max(step.precip, PRECIP_THRESHOLD_MM_H);
        weight += w;
        score += CONFIDENCE_SCORE[step.phase.confidence] * w;
        if (step.phase.confidence === 'low') lowWeight += w;
    }
    if (!weight) return 'low';
    const mean = score / weight;
    if (lowWeight / weight >= 0.35 || mean < 1.65) return 'low';
    if (mean >= 2.55) return 'high';
    return 'medium';
}
/** Summarise the next terrain-relevant wintry precipitation event. */ function nextWintryEvent(point, terrainM, fromTime, horizonHours = 144) {
    if (!point?.times?.length || terrainM === null || !Number.isFinite(terrainM)) return null;
    const times = point.times;
    const horizonEnd = Math.min(times[0] + 144 * 3600_000, times.at(-1) + forecastIntervalHours(times, times.length - 1) * 3600_000, fromTime + horizonHours * 3600_000);
    const qualifying = [];
    for(let i = 0; i < times.length && times[i] < horizonEnd; i++){
        const intervalEnd = times[i] + forecastIntervalHours(times, i) * 3600_000;
        if (intervalEnd <= fromTime) continue;
        const precip = precipMmAt(point.forecast, i);
        if (precip === null || precip < PRECIP_THRESHOLD_MM_H) continue;
        const phase = diagnosedPhase(point, i, terrainM);
        if (!phase || !WINTRY_KEYS.has(phase.key)) continue;
        qualifying.push({
            index: i,
            time: times[i],
            precip,
            phase
        });
    }
    if (!qualifying.length) return null;
    const event = [
        qualifying[0]
    ];
    for(let i = 1; i < qualifying.length; i++){
        const gapH = (qualifying[i].time - event[event.length - 1].time) / 3600_000;
        if (gapH > MAX_EVENT_GAP_HOURS) break;
        event.push(qualifying[i]);
    }
    const startTime = event[0].time;
    const last = event[event.length - 1];
    const endTime = Math.min(horizonEnd, last.time + forecastIntervalHours(times, last.index) * 3600_000);
    let peak = event[0];
    let minSnowlineM = null;
    const phaseWeights = new Map();
    for (const step of event){
        if (step.precip > peak.precip) peak = step;
        const snowline = wetBulbZeroHeight(buildProfile(point.forecast, step.index)).snowLevelM;
        if (snowline !== null && Number.isFinite(snowline)) minSnowlineM = minSnowlineM === null ? snowline : Math.min(minSnowlineM, snowline);
        const current = phaseWeights.get(step.phase.key);
        phaseWeights.set(step.phase.key, {
            weight: (current?.weight ?? 0) + Math.max(step.precip, PRECIP_THRESHOLD_MM_H),
            phase: current?.phase ?? step.phase
        });
    }
    let dominant = event[0].phase;
    let dominantWeight = -1;
    for (const value of phaseWeights.values()){
        if (value.weight > dominantWeight) {
            dominantWeight = value.weight;
            dominant = value.phase;
        }
    }
    let snowpack = 0;
    let incomplete = false;
    const startIndex = event[0].index;
    const endIndex = event[event.length - 1].index;
    for(let i = startIndex; i <= endIndex; i++){
        const phase = diagnosedPhase(point, i, terrainM);
        const precip = precipMmAt(point.forecast, i);
        const intervalStart = Math.max(fromTime, times[i]);
        const intervalEnd = Math.min(endTime, times[i] + forecastIntervalHours(times, i) * 3600_000);
        const dt = (intervalEnd - intervalStart) / 3600_000;
        if (dt <= 0) continue;
        if (precip === null || precip >= PRECIP_THRESHOLD_MM_H && !phase) incomplete = true;
        snowpack = estimateNewSnowStep(precip, phase, snowpack, dt).cumulativeCm;
    }
    return {
        startTime,
        endTime,
        peakTime: peak.time,
        peakPrecipMm3h: peak.precip,
        minSnowlineM: minSnowlineM === null ? null : Math.round(minSnowlineM / 10) * 10,
        newSnowCm: snowpack,
        dominantPhase: dominant,
        confidence: aggregateConfidence(event),
        activeNow: fromTime >= startTime && fromTime < endTime,
        incomplete
    };
}

function conditionLabel(precip, phase) {
    if (precip === null || !Number.isFinite(precip)) return 'Precipitation unavailable';
    if (precip < PRECIP_THRESHOLD_MM_3H) return 'Dry';
    return phase ? precipitationLabel(phase) : 'Precipitation · type uncertain';
}
/** Absence of an event is only meaningful over intervals we could classify. */ function noEventMessage(point, terrainM, fromTime) {
    if (!point?.times?.length || terrainM === null || !Number.isFinite(terrainM)) return 'Wintry outlook unavailable';
    const end = Math.min(point.times[0] + 144 * 3600_000, point.times.at(-1) + forecastIntervalHours(point.times, point.times.length - 1) * 3600_000);
    if (fromTime >= end) return 'Outside available forecast';
    let coveredUntil = fromTime;
    const partialOutlook = ()=>{
        const hours = Math.floor((coveredUntil - fromTime) / 3600_000);
        return coveredUntil > fromTime ? `No wintry precipitation for ${hours > 0 ? hours : '<1'} h` : 'Outlook unavailable · forecast data missing';
    };
    for(let i = 0; i < point.times.length && point.times[i] < end; i++){
        const start = point.times[i], intervalEnd = Math.min(end, start + forecastIntervalHours(point.times, i) * 3600_000);
        if (intervalEnd <= fromTime) continue;
        const precip = precipMmAt(point.forecast, i);
        if (start > coveredUntil || precip === null || precip >= PRECIP_THRESHOLD_MM_3H && !terrainPrecipitationType(buildProfile(point.forecast, i), terrainM)) {
            return partialOutlook();
        }
        coveredUntil = intervalEnd;
    }
    return coveredUntil >= end ? 'No wintry precipitation in the available forecast' : partialOutlook();
}

const HOUR = 3600_000;
/** Reject malformed axes instead of shifting weather values onto other times. */ function buildForecastTimes(data, refTime) {
    const length = Number(data.hours?.length);
    if (!Number.isInteger(length) || length <= 0) return [];
    const times = [];
    for(let i = 0; i < length; i++){
        const raw = valueAt(data.hours, i);
        if (raw === null) return [];
        const time = raw > 1e12 ? raw : raw > 1e9 ? raw * 1000 : refTime === null ? NaN : refTime + raw * HOUR;
        if (!Number.isFinite(time) || i > 0 && time <= times[i - 1]) return [];
        times.push(time);
    }
    return times.filter((time)=>time <= times[0] + 144 * HOUR);
}
function intervalEnd(times, index) {
    return Math.min(times[0] + 144 * HOUR, times[index] + forecastIntervalHours(times, index) * HOUR);
}
/** A total for a requested window requires continuous, known intervals. */ function coversWindow(times, known, start, end) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return false;
    let covered = start;
    for(let i = 0; i < times.length && times[i] < end; i++){
        const until = intervalEnd(times, i);
        if (until <= start) continue;
        if (times[i] > covered || !known[i]) return false;
        covered = Math.max(covered, until);
        if (covered >= end) return true;
    }
    return false;
}

/** A cumulative estimate is supported only up to the first unknown interval. */ function forecastCoverage(precip, phases, times) {
    const known = precip.map((value, i)=>value !== null && Number.isFinite(value) && value >= 0 && Number.isFinite(times[i]) && (value < PRECIP_THRESHOLD_MM_3H || phases[i] != null));
    let prefix = 0;
    while(prefix < known.length && known[prefix] && (prefix === 0 || times[prefix] > times[prefix - 1] && times[prefix] - times[prefix - 1] <= 3 * 3600_000))prefix++;
    const complete = known.length > 0 && prefix === known.length;
    const precipCount = precip.filter((value)=>value !== null && Number.isFinite(value)).length;
    const note = complete ? '' : known.slice(prefix).some(Boolean) ? 'Forecast has gaps' : '';
    return {
        known,
        prefix,
        complete,
        precipCount,
        note: precipCount === 0 ? 'Forecast unavailable' : note
    };
}

function saturationVapourPressure(tempC) {
    return 6.112 * Math.exp(17.67 * tempC / (tempC + 243.5));
}
function relativeHumidityPct(tempC, dewpointC) {
    const td = Math.min(tempC, dewpointC);
    const rh = 100 * saturationVapourPressure(td) / saturationVapourPressure(tempC);
    return Math.max(0, Math.min(100, rh));
}
function interpolate(a, b, heightM) {
    const dz = b.heightM - a.heightM;
    const f = Math.abs(dz) < 1e-6 ? 0 : (heightM - a.heightM) / dz;
    const lerp = (x, y)=>x + f * (y - x);
    return {
        level: a.level,
        pressureHpa: Math.exp(lerp(Math.log(a.pressureHpa), Math.log(b.pressureHpa))),
        heightM,
        tempC: lerp(a.tempC, b.tempC),
        dewpointC: lerp(a.dewpointC, b.dewpointC),
        wetBulbC: lerp(a.wetBulbC, b.wetBulbC)
    };
}
function profileAtHeight(profile, heightM) {
    const p = profile.filter((v)=>Number.isFinite(v.heightM) && Number.isFinite(v.tempC) && Number.isFinite(v.dewpointC)).sort((a, b)=>a.heightM - b.heightM);
    if (p.length < 2 || !Number.isFinite(heightM) || heightM > p[p.length - 1].heightM) return null;
    if (heightM <= p[0].heightM) return {
        point: {
            ...p[0],
            heightM
        },
        extrapolated: true
    };
    for(let i = 0; i < p.length - 1; i++){
        if (heightM >= p[i].heightM && heightM <= p[i + 1].heightM) {
            return {
                point: interpolate(p[i], p[i + 1], heightM),
                extrapolated: false
            };
        }
    }
    return null;
}
function layerPoint(profile, targetM) {
    return profileAtHeight(profile, targetM)?.point ?? null;
}
/**
 * Compact profile-only convective-snow environment diagnostic.
 *
 * This is intentionally not a thunder/lightning forecast. It flags a profile
 * that can support convective snow showers: steep low/mid-level lapse rate and
 * a moist dendritic-growth zone (-18 to -12 C). The precipitation-type routine
 * decides whether falling precipitation is actually snow/wet snow.
 */ function terrainDiagnostics(profile, terrainM) {
    const surface = profileAtHeight(profile, terrainM);
    if (!surface) return null;
    const topTarget = terrainM + 3000;
    const top = layerPoint(profile, topTarget);
    const lapseRateCPerKm = top ? (surface.point.tempC - top.tempC) / Math.max(0.1, (top.heightM - terrainM) / 1000) : null;
    const dgz = profile.filter((v)=>v.heightM >= terrainM && v.tempC <= -12 && v.tempC >= -18 && Number.isFinite(v.dewpointC));
    const snowGrowthRhPct = dgz.length ? dgz.reduce((sum, v)=>sum + relativeHumidityPct(v.tempC, v.dewpointC), 0) / dgz.length : null;
    // 6.5 C/km is a deliberately conservative "steep" profile threshold;
    // 80% RH requires a reasonably moist dendritic-growth layer.
    const convectiveEnvironment = lapseRateCPerKm !== null && lapseRateCPerKm >= 6.5 && snowGrowthRhPct !== null && snowGrowthRhPct >= 80;
    return {
        tempC: surface.point.tempC,
        dewpointC: surface.point.dewpointC,
        wetBulbC: surface.point.wetBulbC,
        rhPct: relativeHumidityPct(surface.point.tempC, surface.point.dewpointC),
        pressureHpa: surface.point.pressureHpa,
        extrapolated: surface.extrapolated,
        lapseRateCPerKm,
        snowGrowthRhPct,
        convectiveEnvironment
    };
}

/* src\SoundingChart.svelte generated by Svelte v4.2.20 */

function add_css$2(target) {
	append_styles(target, "svelte-1jsw3cb", ".sounding-shell.svelte-1jsw3cb.svelte-1jsw3cb{position:fixed;z-index:10025;width:min(390px, calc(100vw - 12px));padding:10px 11px;border:1px solid rgba(139, 213, 244, 0.34);border-radius:13px;background:linear-gradient(180deg, rgba(14, 23, 30, 0.995), rgba(8, 15, 20, 0.995));color:#fff;box-shadow:0 16px 42px rgba(0, 0, 0, 0.56)}.sounding-shell.sounding-embedded.svelte-1jsw3cb.svelte-1jsw3cb{position:relative;left:auto!important;top:auto!important;z-index:auto;width:100%;box-sizing:border-box;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}.sounding-shell.sounding-embedded.svelte-1jsw3cb .sounding-hover.svelte-1jsw3cb{top:54px;right:10px}.sounding-embedded.svelte-1jsw3cb .embedded-head.svelte-1jsw3cb{justify-content:flex-end;margin-bottom:4px}.sounding-embedded.svelte-1jsw3cb .sounding-viewport.svelte-1jsw3cb{max-height:none;overflow:hidden;cursor:default}.sounding-embedded.svelte-1jsw3cb .sounding-viewport.zoomed.svelte-1jsw3cb{max-height:56vh;overflow:auto;cursor:grab}.head.svelte-1jsw3cb.svelte-1jsw3cb{display:flex;justify-content:space-between;gap:8px}.head.svelte-1jsw3cb>div.svelte-1jsw3cb:first-child{min-width:0;flex:1}.head.svelte-1jsw3cb b.svelte-1jsw3cb{display:block;font-size:14px}.head.svelte-1jsw3cb small.svelte-1jsw3cb,.head.svelte-1jsw3cb em.svelte-1jsw3cb{display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.head.svelte-1jsw3cb small.svelte-1jsw3cb{margin-top:2px;color:#a8b7c0;font-size:8px}.head.svelte-1jsw3cb em.svelte-1jsw3cb{margin-top:2px;color:#6ecdf2;font-size:7.5px}.actions.svelte-1jsw3cb.svelte-1jsw3cb{display:flex;gap:3px;align-items:flex-start}.actions.svelte-1jsw3cb button.svelte-1jsw3cb{min-width:25px;height:27px;padding:0 5px;border:1px solid rgba(255, 255, 255, 0.09);border-radius:7px;background:rgba(255, 255, 255, 0.07);color:#fff;font-size:13px;font-weight:800;cursor:pointer}.actions.svelte-1jsw3cb button.svelte-1jsw3cb:hover{background:rgba(105, 212, 255, 0.14)}.actions.svelte-1jsw3cb .png.svelte-1jsw3cb{font-size:7px;padding:0 6px}.actions.svelte-1jsw3cb .zoom-readout.svelte-1jsw3cb{min-width:43px;font-size:7px}.drag.svelte-1jsw3cb.svelte-1jsw3cb{cursor:grab!important;touch-action:none}.phase-banner.svelte-1jsw3cb.svelte-1jsw3cb{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:2px 8px;margin-top:5px;padding:7px 9px;border:1px solid rgba(255, 255, 255, 0.08);border-left:3px solid #82939d;border-radius:8px;background:rgba(255, 255, 255, 0.035)}.phase-banner.svelte-1jsw3cb small.svelte-1jsw3cb{grid-row:0.33333333;color:#7e8f99;font-size:6px;text-transform:uppercase;letter-spacing:0.3px}.phase-banner.svelte-1jsw3cb b.svelte-1jsw3cb{font-size:10px}.phase-banner.snow.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#b2b2b2}.phase-banner.wet-snow.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#569456}.phase-banner.mix.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#95a109}.phase-banner.rain.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#0099b6}.phase-banner.ice.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#510c0f}.phase-banner.freezing-rain.svelte-1jsw3cb.svelte-1jsw3cb{border-left-color:#900096}.phase-banner.dry.svelte-1jsw3cb.svelte-1jsw3cb{opacity:0.82}.sounding-viewport.svelte-1jsw3cb.svelte-1jsw3cb{max-height:430px;overflow:auto;margin-top:6px;border-radius:9px;overscroll-behavior:contain;touch-action:none;cursor:grab;scrollbar-width:thin}.sounding-viewport.svelte-1jsw3cb.svelte-1jsw3cb:active{cursor:grabbing}.sounding-viewport.svelte-1jsw3cb.svelte-1jsw3cb:focus-visible{outline:1px solid rgba(105, 212, 255, 0.55);outline-offset:2px}.sounding-viewport.svelte-1jsw3cb svg.svelte-1jsw3cb{display:block;min-width:100%;height:auto;margin:0;transform-origin:top left;user-select:none;-webkit-user-select:none}.plot-bg.svelte-1jsw3cb.svelte-1jsw3cb{fill:#0d171d;stroke:#263a46}.terrain-zone.svelte-1jsw3cb.svelte-1jsw3cb{fill:rgba(255, 174, 86, 0.08)}.terrain-line.svelte-1jsw3cb.svelte-1jsw3cb{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-text.svelte-1jsw3cb.svelte-1jsw3cb{fill:#ffbd75;font-size:7px}.snowline-marker.svelte-1jsw3cb.svelte-1jsw3cb{stroke:#69d4ff;stroke-width:1.5;stroke-dasharray:4 3}.snowline-tag-bg.svelte-1jsw3cb.svelte-1jsw3cb{fill:rgba(16, 43, 54, 0.94)}.snowline-tag.svelte-1jsw3cb.svelte-1jsw3cb{fill:#aeeaff;font-size:7px;font-weight:800}.temp-grid.svelte-1jsw3cb.svelte-1jsw3cb{stroke:rgba(154, 181, 196, 0.1)}.temp-grid.zero.svelte-1jsw3cb.svelte-1jsw3cb{stroke:rgba(117, 202, 239, 0.5);stroke-width:1.3}.pressure-grid.svelte-1jsw3cb.svelte-1jsw3cb{stroke:rgba(154, 181, 196, 0.12)}.axis.svelte-1jsw3cb.svelte-1jsw3cb{fill:#758995;font-size:7px;font-family:sans-serif}.temp-line.svelte-1jsw3cb.svelte-1jsw3cb{fill:none;stroke:#ff765f;stroke-width:2.4}.dew-line.svelte-1jsw3cb.svelte-1jsw3cb{fill:none;stroke:#72d98b;stroke-width:2.1}.wetbulb-line.svelte-1jsw3cb.svelte-1jsw3cb{fill:none;stroke:#69d4ff;stroke-width:1.7;stroke-dasharray:4 3}.temp-dot.svelte-1jsw3cb.svelte-1jsw3cb{fill:#ff765f}.dew-dot.svelte-1jsw3cb.svelte-1jsw3cb{fill:#72d98b}.key.svelte-1jsw3cb.svelte-1jsw3cb{display:flex;flex-wrap:wrap;gap:5px 10px;margin:4px 2px 6px;color:#a0b0ba;font-size:7px}.key.svelte-1jsw3cb span.svelte-1jsw3cb{display:flex;align-items:center;gap:4px}.key.svelte-1jsw3cb i.svelte-1jsw3cb{display:inline-block;width:13px;border-top:2px solid}.key.svelte-1jsw3cb .t.svelte-1jsw3cb{border-color:#ff765f}.key.svelte-1jsw3cb .d.svelte-1jsw3cb{border-color:#72d98b}.key.svelte-1jsw3cb .w.svelte-1jsw3cb{border-color:#69d4ff;border-top-style:dashed}.key.svelte-1jsw3cb .z.svelte-1jsw3cb{border-color:#75caef}.stats.svelte-1jsw3cb.svelte-1jsw3cb{display:grid;grid-template-columns:repeat(2, 1fr);gap:4px}.stats.svelte-1jsw3cb span.svelte-1jsw3cb{padding:5px 2px;border-radius:7px;background:rgba(255, 255, 255, 0.035);text-align:center}.stats.svelte-1jsw3cb small.svelte-1jsw3cb{display:block;color:#71838e;font-size:5.6px}.stats.svelte-1jsw3cb b.svelte-1jsw3cb{display:block;margin-top:2px;font-size:6.7px;white-space:nowrap}.hint.svelte-1jsw3cb.svelte-1jsw3cb{margin-top:5px;color:#60717b;font-size:6.2px;text-align:center}.empty.svelte-1jsw3cb.svelte-1jsw3cb{padding:30px 8px;text-align:center;color:#82939d;font-size:9px}@media(max-width: 520px){.sounding-shell.svelte-1jsw3cb.svelte-1jsw3cb{width:calc(100vw - 12px);padding:9px}.head.svelte-1jsw3cb small.svelte-1jsw3cb,.head.svelte-1jsw3cb em.svelte-1jsw3cb{max-width:125px}.stats.svelte-1jsw3cb b.svelte-1jsw3cb{font-size:6.3px}.sounding-viewport.svelte-1jsw3cb.svelte-1jsw3cb{max-height:55vh}.actions.svelte-1jsw3cb.svelte-1jsw3cb{gap:2px}.actions.svelte-1jsw3cb button.svelte-1jsw3cb{min-width:24px;height:26px}.actions.svelte-1jsw3cb .png.svelte-1jsw3cb{display:none !important}.actions.svelte-1jsw3cb .zoom-readout.svelte-1jsw3cb{min-width:38px}}.hover-level.svelte-1jsw3cb.svelte-1jsw3cb{stroke:rgba(255, 255, 255, 0.58);stroke-width:1;stroke-dasharray:2 2}.hover-temp.svelte-1jsw3cb.svelte-1jsw3cb{fill:#0d171d;stroke:#ff765f;stroke-width:2}.hover-dew.svelte-1jsw3cb.svelte-1jsw3cb{fill:#0d171d;stroke:#72d98b;stroke-width:2}.hover-wet.svelte-1jsw3cb.svelte-1jsw3cb{fill:#0d171d;stroke:#69d4ff;stroke-width:2}.sounding-hover.svelte-1jsw3cb.svelte-1jsw3cb{position:absolute;z-index:6;top:78px;right:14px;display:grid;grid-template-columns:repeat(3, auto);gap:4px 8px;width:160px;max-width:calc(100% - 28px);box-sizing:border-box;padding:7px 8px;border:1px solid rgba(255, 255, 255, 0.16);border-radius:8px;background:rgba(5, 10, 14, 0.96);box-shadow:0 8px 22px rgba(0, 0, 0, 0.48);pointer-events:none}.sounding-hover.svelte-1jsw3cb b.svelte-1jsw3cb{grid-column:-1;color:#eaf5fa;font-size:8px}.sounding-hover.svelte-1jsw3cb span.svelte-1jsw3cb{color:#aebcc4;font-size:7px;font-weight:750}.actions.svelte-1jsw3cb .png.svelte-1jsw3cb{display:inline-block !important;font-size:10px}.actions.svelte-1jsw3cb button.svelte-1jsw3cb{min-height:32px}.stats.svelte-1jsw3cb small.svelte-1jsw3cb{font-size:10px}.stats.svelte-1jsw3cb b.svelte-1jsw3cb{font-size:12px}.hint.svelte-1jsw3cb.svelte-1jsw3cb{font-size:10px}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[48] = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[51] = list[i];
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[51] = list[i];
	return child_ctx;
}

// (3:4) {#if !embedded}
function create_if_block_6$2(ctx) {
	let div;
	let b;
	let t1;
	let small;
	let t2_value = (/*placeName*/ ctx[0] || 'Selected point') + "";
	let t2;
	let t3;
	let em;
	let t4;

	return {
		c() {
			div = element("div");
			b = element("b");
			b.textContent = "Forecast sounding";
			t1 = space();
			small = element("small");
			t2 = text(t2_value);
			t3 = space();
			em = element("em");
			t4 = text(/*validLabel*/ ctx[11]);
			attr(b, "class", "svelte-1jsw3cb");
			attr(small, "class", "svelte-1jsw3cb");
			attr(em, "class", "svelte-1jsw3cb");
			attr(div, "class", "svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, b);
			append(div, t1);
			append(div, small);
			append(small, t2);
			append(div, t3);
			append(div, em);
			append(em, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*placeName*/ 1 && t2_value !== (t2_value = (/*placeName*/ ctx[0] || 'Selected point') + "")) set_data(t2, t2_value);
			if (dirty[0] & /*validLabel*/ 2048) set_data(t4, /*validLabel*/ ctx[11]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (13:6) {#if !embedded}
function create_if_block_5$2(ctx) {
	let button0;
	let t1;
	let button1;
	let mounted;
	let dispose;

	return {
		c() {
			button0 = element("button");
			button0.textContent = "↕";
			t1 = space();
			button1 = element("button");
			button1.textContent = "×";
			attr(button0, "class", "drag svelte-1jsw3cb");
			attr(button0, "type", "button");
			attr(button0, "title", "Drag sounding window");
			attr(button0, "aria-label", "Drag sounding window");
			attr(button1, "type", "button");
			attr(button1, "title", "Close");
			attr(button1, "aria-label", "Close sounding");
			attr(button1, "class", "svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, button0, anchor);
			insert(target, t1, anchor);
			insert(target, button1, anchor);

			if (!mounted) {
				dispose = [
					listen(button0, "pointerdown", /*startDrag*/ ctx[13]),
					listen(button1, "click", /*click_handler_2*/ ctx[28])
				];

				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button0);
				detach(t1);
				detach(button1);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (76:2) {:else}
function create_else_block$2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Sounding unavailable for this forecast time.";
			attr(div, "class", "empty svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (18:2) {#if sounding}
function create_if_block$2(ctx) {
	let div0;
	let small0;
	let b0;
	let t1_value = /*sounding*/ ctx[3].phaseLabel + "";
	let t1;
	let t2;
	let div1;
	let svg;
	let rect;
	let each0_anchor;
	let each1_anchor;
	let if_block0_anchor;
	let polyline0;
	let polyline0_points_value;
	let polyline1;
	let polyline1_points_value;
	let polyline2;
	let polyline2_points_value;
	let each2_anchor;
	let svg_style_value;
	let t3;
	let t4;
	let div2;
	let t12;
	let div3;
	let span4;
	let small1;
	let b1;
	let t14_value = /*sounding*/ ctx[3].surfaceTw + "";
	let t14;
	let t15;
	let span5;
	let small2;
	let b2;
	let t17_value = /*sounding*/ ctx[3].snowline + "";
	let t17;
	let t18;
	let div4;
	let mounted;
	let dispose;
	let each_value_2 = ensure_array_like(/*sounding*/ ctx[3].tempGrid);
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
	}

	let each_value_1 = ensure_array_like(/*sounding*/ ctx[3].pressureGrid);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
	}

	let if_block0 = /*sounding*/ ctx[3].terrainY !== null && create_if_block_4$2(ctx);
	let if_block1 = /*sounding*/ ctx[3].snowlineY !== null && create_if_block_3$2(ctx);
	let each_value = ensure_array_like(/*sounding*/ ctx[3].nodes);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	let if_block2 = /*hoverNode*/ ctx[10] && create_if_block_2$2(ctx);
	let if_block3 = /*hoverNode*/ ctx[10] && create_if_block_1$2(ctx);

	return {
		c() {
			div0 = element("div");
			small0 = element("small");
			small0.textContent = "At terrain";
			b0 = element("b");
			t1 = text(t1_value);
			t2 = space();
			div1 = element("div");
			svg = svg_element("svg");
			rect = svg_element("rect");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			each0_anchor = empty();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			each1_anchor = empty();
			if (if_block0) if_block0.c();
			if_block0_anchor = empty();
			if (if_block1) if_block1.c();
			polyline0 = svg_element("polyline");
			polyline1 = svg_element("polyline");
			polyline2 = svg_element("polyline");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each2_anchor = empty();
			if (if_block2) if_block2.c();
			t3 = space();
			if (if_block3) if_block3.c();
			t4 = space();
			div2 = element("div");
			div2.innerHTML = `<span class="svelte-1jsw3cb"><i class="t svelte-1jsw3cb"></i>Temp</span> <span class="svelte-1jsw3cb"><i class="d svelte-1jsw3cb"></i>Dew point</span> <span class="svelte-1jsw3cb"><i class="w svelte-1jsw3cb"></i>Wet bulb</span> <span class="svelte-1jsw3cb"><i class="z svelte-1jsw3cb"></i>0°C</span>`;
			t12 = space();
			div3 = element("div");
			span4 = element("span");
			small1 = element("small");
			small1.textContent = "Terrain Tw";
			b1 = element("b");
			t14 = text(t14_value);
			t15 = space();
			span5 = element("span");
			small2 = element("small");
			small2.textContent = "Snowline";
			b2 = element("b");
			t17 = text(t17_value);
			t18 = space();
			div4 = element("div");
			div4.textContent = "Hover/touch for T, Td and Tw · +/- to zoom · Fit to reset";
			attr(small0, "class", "svelte-1jsw3cb");
			attr(b0, "class", "svelte-1jsw3cb");
			attr(div0, "class", "phase-banner svelte-1jsw3cb");
			toggle_class(div0, "dry", !/*sounding*/ ctx[3].phaseKey);
			toggle_class(div0, "snow", /*sounding*/ ctx[3].phaseKey === 'snow');
			toggle_class(div0, "wet-snow", /*sounding*/ ctx[3].phaseKey === 'wet-snow');
			toggle_class(div0, "mix", /*sounding*/ ctx[3].phaseKey === 'mix');
			toggle_class(div0, "rain", /*sounding*/ ctx[3].phaseKey === 'rain');
			toggle_class(div0, "ice", /*sounding*/ ctx[3].phaseKey === 'ice-pellets');
			toggle_class(div0, "freezing-rain", /*sounding*/ ctx[3].phaseKey === 'freezing-rain');
			attr(rect, "x", "48");
			attr(rect, "y", "22");
			attr(rect, "width", "262");
			attr(rect, "height", "320");
			attr(rect, "rx", "9");
			attr(rect, "class", "plot-bg svelte-1jsw3cb");
			attr(polyline0, "points", polyline0_points_value = /*sounding*/ ctx[3].tempPoints);
			attr(polyline0, "class", "temp-line svelte-1jsw3cb");
			attr(polyline1, "points", polyline1_points_value = /*sounding*/ ctx[3].dewPoints);
			attr(polyline1, "class", "dew-line svelte-1jsw3cb");
			attr(polyline2, "points", polyline2_points_value = /*sounding*/ ctx[3].wetBulbPoints);
			attr(polyline2, "class", "wetbulb-line svelte-1jsw3cb");
			attr(svg, "viewBox", "0 0 330 390");
			attr(svg, "role", "img");
			attr(svg, "aria-label", "Temperature, dew point and wet-bulb vertical profile");
			attr(svg, "style", svg_style_value = `width:${/*zoom*/ ctx[8] * 100}%;`);
			attr(svg, "class", "svelte-1jsw3cb");
			attr(div1, "class", "sounding-viewport svelte-1jsw3cb");
			attr(div1, "tabindex", "0");
			attr(div1, "role", "application");
			attr(div1, "aria-label", "Zoomable forecast sounding");
			toggle_class(div1, "zoomed", /*zoom*/ ctx[8] > 1.001);
			attr(div2, "class", "key svelte-1jsw3cb");
			attr(small1, "class", "svelte-1jsw3cb");
			attr(b1, "class", "svelte-1jsw3cb");
			attr(span4, "class", "svelte-1jsw3cb");
			attr(small2, "class", "svelte-1jsw3cb");
			attr(b2, "class", "svelte-1jsw3cb");
			attr(span5, "class", "svelte-1jsw3cb");
			attr(div3, "class", "stats svelte-1jsw3cb");
			attr(div4, "class", "hint svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, small0);
			append(div0, b0);
			append(b0, t1);
			insert(target, t2, anchor);
			insert(target, div1, anchor);
			append(div1, svg);
			append(svg, rect);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				if (each_blocks_2[i]) {
					each_blocks_2[i].m(svg, null);
				}
			}

			append(svg, each0_anchor);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(svg, null);
				}
			}

			append(svg, each1_anchor);
			if (if_block0) if_block0.m(svg, null);
			append(svg, if_block0_anchor);
			if (if_block1) if_block1.m(svg, null);
			append(svg, polyline0);
			append(svg, polyline1);
			append(svg, polyline2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(svg, null);
				}
			}

			append(svg, each2_anchor);
			if (if_block2) if_block2.m(svg, null);
			/*svg_binding*/ ctx[29](svg);
			/*div1_binding*/ ctx[30](div1);
			insert(target, t3, anchor);
			if (if_block3) if_block3.m(target, anchor);
			insert(target, t4, anchor);
			insert(target, div2, anchor);
			insert(target, t12, anchor);
			insert(target, div3, anchor);
			append(div3, span4);
			append(span4, small1);
			append(span4, b1);
			append(b1, t14);
			append(div3, t15);
			append(div3, span5);
			append(span5, small2);
			append(span5, b2);
			append(b2, t17);
			insert(target, t18, anchor);
			insert(target, div4, anchor);

			if (!mounted) {
				dispose = [
					listen(div1, "wheel", prevent_default(/*handleWheel*/ ctx[16])),
					listen(div1, "pointerdown", /*startPlotPointer*/ ctx[17]),
					listen(div1, "pointermove", /*movePlotPointer*/ ctx[19]),
					listen(div1, "pointerup", /*endPlotPointer*/ ctx[20]),
					listen(div1, "pointercancel", /*endPlotPointer*/ ctx[20]),
					listen(div1, "pointerleave", /*leavePlot*/ ctx[18]),
					listen(div1, "dblclick", /*resetZoom*/ ctx[15]),
					listen(div1, "keydown", /*handleViewportKey*/ ctx[21])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && t1_value !== (t1_value = /*sounding*/ ctx[3].phaseLabel + "")) set_data(t1, t1_value);

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "dry", !/*sounding*/ ctx[3].phaseKey);
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "snow", /*sounding*/ ctx[3].phaseKey === 'snow');
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "wet-snow", /*sounding*/ ctx[3].phaseKey === 'wet-snow');
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "mix", /*sounding*/ ctx[3].phaseKey === 'mix');
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "rain", /*sounding*/ ctx[3].phaseKey === 'rain');
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "ice", /*sounding*/ ctx[3].phaseKey === 'ice-pellets');
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(div0, "freezing-rain", /*sounding*/ ctx[3].phaseKey === 'freezing-rain');
			}

			if (dirty[0] & /*sounding, units*/ 12) {
				each_value_2 = ensure_array_like(/*sounding*/ ctx[3].tempGrid);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_2$1(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(svg, each0_anchor);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_2.length;
			}

			if (dirty[0] & /*sounding*/ 8) {
				each_value_1 = ensure_array_like(/*sounding*/ ctx[3].pressureGrid);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1$1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(svg, each1_anchor);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (/*sounding*/ ctx[3].terrainY !== null) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_4$2(ctx);
					if_block0.c();
					if_block0.m(svg, if_block0_anchor);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*sounding*/ ctx[3].snowlineY !== null) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_3$2(ctx);
					if_block1.c();
					if_block1.m(svg, polyline0);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*sounding*/ 8 && polyline0_points_value !== (polyline0_points_value = /*sounding*/ ctx[3].tempPoints)) {
				attr(polyline0, "points", polyline0_points_value);
			}

			if (dirty[0] & /*sounding*/ 8 && polyline1_points_value !== (polyline1_points_value = /*sounding*/ ctx[3].dewPoints)) {
				attr(polyline1, "points", polyline1_points_value);
			}

			if (dirty[0] & /*sounding*/ 8 && polyline2_points_value !== (polyline2_points_value = /*sounding*/ ctx[3].wetBulbPoints)) {
				attr(polyline2, "points", polyline2_points_value);
			}

			if (dirty[0] & /*sounding*/ 8) {
				each_value = ensure_array_like(/*sounding*/ ctx[3].nodes);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(svg, each2_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (/*hoverNode*/ ctx[10]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_2$2(ctx);
					if_block2.c();
					if_block2.m(svg, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*zoom*/ 256 && svg_style_value !== (svg_style_value = `width:${/*zoom*/ ctx[8] * 100}%;`)) {
				attr(svg, "style", svg_style_value);
			}

			if (dirty[0] & /*zoom*/ 256) {
				toggle_class(div1, "zoomed", /*zoom*/ ctx[8] > 1.001);
			}

			if (/*hoverNode*/ ctx[10]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_1$2(ctx);
					if_block3.c();
					if_block3.m(t4.parentNode, t4);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty[0] & /*sounding*/ 8 && t14_value !== (t14_value = /*sounding*/ ctx[3].surfaceTw + "")) set_data(t14, t14_value);
			if (dirty[0] & /*sounding*/ 8 && t17_value !== (t17_value = /*sounding*/ ctx[3].snowline + "")) set_data(t17, t17_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t2);
				detach(div1);
				detach(t3);
				detach(t4);
				detach(div2);
				detach(t12);
				detach(div3);
				detach(t18);
				detach(div4);
			}

			destroy_each(each_blocks_2, detaching);
			destroy_each(each_blocks_1, detaching);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			destroy_each(each_blocks, detaching);
			if (if_block2) if_block2.d();
			/*svg_binding*/ ctx[29](null);
			/*div1_binding*/ ctx[30](null);
			if (if_block3) if_block3.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (27:8) {#each sounding.tempGrid as g}
function create_each_block_2$1(ctx) {
	let line;
	let line_x__value;
	let line_x__value_1;
	let text_1;

	let t0_value = (/*units*/ ctx[2] === 'imperial'
	? Math.round(/*g*/ ctx[51].value * 9 / 5 + 32)
	: /*g*/ ctx[51].value) + "";

	let t0;
	let t1;
	let text_1_x_value;

	return {
		c() {
			line = svg_element("line");
			text_1 = svg_element("text");
			t0 = text(t0_value);
			t1 = text("°");
			attr(line, "x1", line_x__value = /*g*/ ctx[51].x);
			attr(line, "x2", line_x__value_1 = /*g*/ ctx[51].x);
			attr(line, "y1", "22");
			attr(line, "y2", "342");
			attr(line, "class", "temp-grid svelte-1jsw3cb");
			toggle_class(line, "zero", /*g*/ ctx[51].value === 0);
			attr(text_1, "x", text_1_x_value = /*g*/ ctx[51].x);
			attr(text_1, "y", "360");
			attr(text_1, "text-anchor", "middle");
			attr(text_1, "class", "axis svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, text_1, anchor);
			append(text_1, t0);
			append(text_1, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && line_x__value !== (line_x__value = /*g*/ ctx[51].x)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*sounding*/ 8 && line_x__value_1 !== (line_x__value_1 = /*g*/ ctx[51].x)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*sounding*/ 8) {
				toggle_class(line, "zero", /*g*/ ctx[51].value === 0);
			}

			if (dirty[0] & /*units, sounding*/ 12 && t0_value !== (t0_value = (/*units*/ ctx[2] === 'imperial'
			? Math.round(/*g*/ ctx[51].value * 9 / 5 + 32)
			: /*g*/ ctx[51].value) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*sounding*/ 8 && text_1_x_value !== (text_1_x_value = /*g*/ ctx[51].x)) {
				attr(text_1, "x", text_1_x_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(text_1);
			}
		}
	};
}

// (31:8) {#each sounding.pressureGrid as g}
function create_each_block_1$1(ctx) {
	let line;
	let line_y__value;
	let line_y__value_1;
	let text_1;
	let t_value = /*g*/ ctx[51].label + "";
	let t;
	let text_1_y_value;

	return {
		c() {
			line = svg_element("line");
			text_1 = svg_element("text");
			t = text(t_value);
			attr(line, "x1", "48");
			attr(line, "x2", "310");
			attr(line, "y1", line_y__value = /*g*/ ctx[51].y);
			attr(line, "y2", line_y__value_1 = /*g*/ ctx[51].y);
			attr(line, "class", "pressure-grid svelte-1jsw3cb");
			attr(text_1, "x", "42");
			attr(text_1, "y", text_1_y_value = /*g*/ ctx[51].y + 3);
			attr(text_1, "text-anchor", "end");
			attr(text_1, "class", "axis svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && line_y__value !== (line_y__value = /*g*/ ctx[51].y)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*sounding*/ 8 && line_y__value_1 !== (line_y__value_1 = /*g*/ ctx[51].y)) {
				attr(line, "y2", line_y__value_1);
			}

			if (dirty[0] & /*sounding*/ 8 && t_value !== (t_value = /*g*/ ctx[51].label + "")) set_data(t, t_value);

			if (dirty[0] & /*sounding*/ 8 && text_1_y_value !== (text_1_y_value = /*g*/ ctx[51].y + 3)) {
				attr(text_1, "y", text_1_y_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(text_1);
			}
		}
	};
}

// (36:8) {#if sounding.terrainY !== null}
function create_if_block_4$2(ctx) {
	let rect;
	let rect_y_value;
	let rect_height_value;
	let line;
	let line_y__value;
	let line_y__value_1;
	let text_1;
	let t;
	let text_1_y_value;

	return {
		c() {
			rect = svg_element("rect");
			line = svg_element("line");
			text_1 = svg_element("text");
			t = text("terrain");
			attr(rect, "x", "48");
			attr(rect, "y", rect_y_value = /*sounding*/ ctx[3].terrainY);
			attr(rect, "width", "262");
			attr(rect, "height", rect_height_value = Math.max(0, 342 - /*sounding*/ ctx[3].terrainY));
			attr(rect, "class", "terrain-zone svelte-1jsw3cb");
			attr(line, "x1", "48");
			attr(line, "x2", "310");
			attr(line, "y1", line_y__value = /*sounding*/ ctx[3].terrainY);
			attr(line, "y2", line_y__value_1 = /*sounding*/ ctx[3].terrainY);
			attr(line, "class", "terrain-line svelte-1jsw3cb");
			attr(text_1, "x", "306");
			attr(text_1, "y", text_1_y_value = Math.max(31, /*sounding*/ ctx[3].terrainY - 4));
			attr(text_1, "text-anchor", "end");
			attr(text_1, "class", "terrain-text svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, rect, anchor);
			insert(target, line, anchor);
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && rect_y_value !== (rect_y_value = /*sounding*/ ctx[3].terrainY)) {
				attr(rect, "y", rect_y_value);
			}

			if (dirty[0] & /*sounding*/ 8 && rect_height_value !== (rect_height_value = Math.max(0, 342 - /*sounding*/ ctx[3].terrainY))) {
				attr(rect, "height", rect_height_value);
			}

			if (dirty[0] & /*sounding*/ 8 && line_y__value !== (line_y__value = /*sounding*/ ctx[3].terrainY)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*sounding*/ 8 && line_y__value_1 !== (line_y__value_1 = /*sounding*/ ctx[3].terrainY)) {
				attr(line, "y2", line_y__value_1);
			}

			if (dirty[0] & /*sounding*/ 8 && text_1_y_value !== (text_1_y_value = Math.max(31, /*sounding*/ ctx[3].terrainY - 4))) {
				attr(text_1, "y", text_1_y_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(rect);
				detach(line);
				detach(text_1);
			}
		}
	};
}

// (41:8) {#if sounding.snowlineY !== null}
function create_if_block_3$2(ctx) {
	let line;
	let line_y__value;
	let line_y__value_1;
	let rect;
	let rect_y_value;
	let text_1;
	let t0;
	let t1_value = /*sounding*/ ctx[3].snowline + "";
	let t1;
	let text_1_y_value;

	return {
		c() {
			line = svg_element("line");
			rect = svg_element("rect");
			text_1 = svg_element("text");
			t0 = text("Snowline ");
			t1 = text(t1_value);
			attr(line, "x1", "48");
			attr(line, "x2", "310");
			attr(line, "y1", line_y__value = /*sounding*/ ctx[3].snowlineY);
			attr(line, "y2", line_y__value_1 = /*sounding*/ ctx[3].snowlineY);
			attr(line, "class", "snowline-marker svelte-1jsw3cb");
			attr(rect, "x", "222");
			attr(rect, "y", rect_y_value = Math.max(24, /*sounding*/ ctx[3].snowlineY - 10));
			attr(rect, "width", "84");
			attr(rect, "height", "12");
			attr(rect, "rx", "3");
			attr(rect, "class", "snowline-tag-bg svelte-1jsw3cb");
			attr(text_1, "x", "302");
			attr(text_1, "y", text_1_y_value = Math.max(33, /*sounding*/ ctx[3].snowlineY - 1));
			attr(text_1, "text-anchor", "end");
			attr(text_1, "class", "snowline-tag svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, rect, anchor);
			insert(target, text_1, anchor);
			append(text_1, t0);
			append(text_1, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && line_y__value !== (line_y__value = /*sounding*/ ctx[3].snowlineY)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*sounding*/ 8 && line_y__value_1 !== (line_y__value_1 = /*sounding*/ ctx[3].snowlineY)) {
				attr(line, "y2", line_y__value_1);
			}

			if (dirty[0] & /*sounding*/ 8 && rect_y_value !== (rect_y_value = Math.max(24, /*sounding*/ ctx[3].snowlineY - 10))) {
				attr(rect, "y", rect_y_value);
			}

			if (dirty[0] & /*sounding*/ 8 && t1_value !== (t1_value = /*sounding*/ ctx[3].snowline + "")) set_data(t1, t1_value);

			if (dirty[0] & /*sounding*/ 8 && text_1_y_value !== (text_1_y_value = Math.max(33, /*sounding*/ ctx[3].snowlineY - 1))) {
				attr(text_1, "y", text_1_y_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(rect);
				detach(text_1);
			}
		}
	};
}

// (51:8) {#each sounding.nodes as n}
function create_each_block$1(ctx) {
	let circle0;
	let circle0_cx_value;
	let circle0_cy_value;
	let circle1;
	let circle1_cx_value;
	let circle1_cy_value;

	return {
		c() {
			circle0 = svg_element("circle");
			circle1 = svg_element("circle");
			attr(circle0, "cx", circle0_cx_value = /*n*/ ctx[48].tx);
			attr(circle0, "cy", circle0_cy_value = /*n*/ ctx[48].y);
			attr(circle0, "r", "2.1");
			attr(circle0, "class", "temp-dot svelte-1jsw3cb");
			attr(circle1, "cx", circle1_cx_value = /*n*/ ctx[48].dx);
			attr(circle1, "cy", circle1_cy_value = /*n*/ ctx[48].y);
			attr(circle1, "r", "2");
			attr(circle1, "class", "dew-dot svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, circle0, anchor);
			insert(target, circle1, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sounding*/ 8 && circle0_cx_value !== (circle0_cx_value = /*n*/ ctx[48].tx)) {
				attr(circle0, "cx", circle0_cx_value);
			}

			if (dirty[0] & /*sounding*/ 8 && circle0_cy_value !== (circle0_cy_value = /*n*/ ctx[48].y)) {
				attr(circle0, "cy", circle0_cy_value);
			}

			if (dirty[0] & /*sounding*/ 8 && circle1_cx_value !== (circle1_cx_value = /*n*/ ctx[48].dx)) {
				attr(circle1, "cx", circle1_cx_value);
			}

			if (dirty[0] & /*sounding*/ 8 && circle1_cy_value !== (circle1_cy_value = /*n*/ ctx[48].y)) {
				attr(circle1, "cy", circle1_cy_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(circle0);
				detach(circle1);
			}
		}
	};
}

// (55:8) {#if hoverNode}
function create_if_block_2$2(ctx) {
	let line;
	let line_y__value;
	let line_y__value_1;
	let circle0;
	let circle0_cx_value;
	let circle0_cy_value;
	let circle1;
	let circle1_cx_value;
	let circle1_cy_value;
	let circle2;
	let circle2_cx_value;
	let circle2_cy_value;

	return {
		c() {
			line = svg_element("line");
			circle0 = svg_element("circle");
			circle1 = svg_element("circle");
			circle2 = svg_element("circle");
			attr(line, "x1", "48");
			attr(line, "x2", "310");
			attr(line, "y1", line_y__value = /*hoverNode*/ ctx[10].y);
			attr(line, "y2", line_y__value_1 = /*hoverNode*/ ctx[10].y);
			attr(line, "class", "hover-level svelte-1jsw3cb");
			attr(circle0, "cx", circle0_cx_value = /*hoverNode*/ ctx[10].tx);
			attr(circle0, "cy", circle0_cy_value = /*hoverNode*/ ctx[10].y);
			attr(circle0, "r", "4");
			attr(circle0, "class", "hover-temp svelte-1jsw3cb");
			attr(circle1, "cx", circle1_cx_value = /*hoverNode*/ ctx[10].dx);
			attr(circle1, "cy", circle1_cy_value = /*hoverNode*/ ctx[10].y);
			attr(circle1, "r", "4");
			attr(circle1, "class", "hover-dew svelte-1jsw3cb");
			attr(circle2, "cx", circle2_cx_value = /*hoverNode*/ ctx[10].wx);
			attr(circle2, "cy", circle2_cy_value = /*hoverNode*/ ctx[10].y);
			attr(circle2, "r", "4");
			attr(circle2, "class", "hover-wet svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, circle0, anchor);
			insert(target, circle1, anchor);
			insert(target, circle2, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*hoverNode*/ 1024 && line_y__value !== (line_y__value = /*hoverNode*/ ctx[10].y)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && line_y__value_1 !== (line_y__value_1 = /*hoverNode*/ ctx[10].y)) {
				attr(line, "y2", line_y__value_1);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle0_cx_value !== (circle0_cx_value = /*hoverNode*/ ctx[10].tx)) {
				attr(circle0, "cx", circle0_cx_value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle0_cy_value !== (circle0_cy_value = /*hoverNode*/ ctx[10].y)) {
				attr(circle0, "cy", circle0_cy_value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle1_cx_value !== (circle1_cx_value = /*hoverNode*/ ctx[10].dx)) {
				attr(circle1, "cx", circle1_cx_value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle1_cy_value !== (circle1_cy_value = /*hoverNode*/ ctx[10].y)) {
				attr(circle1, "cy", circle1_cy_value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle2_cx_value !== (circle2_cx_value = /*hoverNode*/ ctx[10].wx)) {
				attr(circle2, "cx", circle2_cx_value);
			}

			if (dirty[0] & /*hoverNode*/ 1024 && circle2_cy_value !== (circle2_cy_value = /*hoverNode*/ ctx[10].y)) {
				attr(circle2, "cy", circle2_cy_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(circle0);
				detach(circle1);
				detach(circle2);
			}
		}
	};
}

// (63:4) {#if hoverNode}
function create_if_block_1$2(ctx) {
	let div;
	let b;
	let t0_value = Math.round(/*hoverNode*/ ctx[10].pressure) + "";
	let t0;
	let t1;
	let t2_value = formatElevation(/*hoverNode*/ ctx[10].height, /*units*/ ctx[2]) + "";
	let t2;
	let span0;
	let t3;
	let t4_value = formatTemperature(/*hoverNode*/ ctx[10].temp, /*units*/ ctx[2]) + "";
	let t4;
	let span1;
	let t5;
	let t6_value = formatTemperature(/*hoverNode*/ ctx[10].dew, /*units*/ ctx[2]) + "";
	let t6;
	let span2;
	let t7;
	let t8_value = formatTemperature(/*hoverNode*/ ctx[10].wet, /*units*/ ctx[2]) + "";
	let t8;

	return {
		c() {
			div = element("div");
			b = element("b");
			t0 = text(t0_value);
			t1 = text(" hPa · ");
			t2 = text(t2_value);
			span0 = element("span");
			t3 = text("T ");
			t4 = text(t4_value);
			span1 = element("span");
			t5 = text("Td ");
			t6 = text(t6_value);
			span2 = element("span");
			t7 = text("Tw ");
			t8 = text(t8_value);
			attr(b, "class", "svelte-1jsw3cb");
			attr(span0, "class", "svelte-1jsw3cb");
			attr(span1, "class", "svelte-1jsw3cb");
			attr(span2, "class", "svelte-1jsw3cb");
			attr(div, "class", "sounding-hover svelte-1jsw3cb");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, b);
			append(b, t0);
			append(b, t1);
			append(b, t2);
			append(div, span0);
			append(span0, t3);
			append(span0, t4);
			append(div, span1);
			append(span1, t5);
			append(span1, t6);
			append(div, span2);
			append(span2, t7);
			append(span2, t8);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*hoverNode*/ 1024 && t0_value !== (t0_value = Math.round(/*hoverNode*/ ctx[10].pressure) + "")) set_data(t0, t0_value);
			if (dirty[0] & /*hoverNode, units*/ 1028 && t2_value !== (t2_value = formatElevation(/*hoverNode*/ ctx[10].height, /*units*/ ctx[2]) + "")) set_data(t2, t2_value);
			if (dirty[0] & /*hoverNode, units*/ 1028 && t4_value !== (t4_value = formatTemperature(/*hoverNode*/ ctx[10].temp, /*units*/ ctx[2]) + "")) set_data(t4, t4_value);
			if (dirty[0] & /*hoverNode, units*/ 1028 && t6_value !== (t6_value = formatTemperature(/*hoverNode*/ ctx[10].dew, /*units*/ ctx[2]) + "")) set_data(t6, t6_value);
			if (dirty[0] & /*hoverNode, units*/ 1028 && t8_value !== (t8_value = formatTemperature(/*hoverNode*/ ctx[10].wet, /*units*/ ctx[2]) + "")) set_data(t8, t8_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment$3(ctx) {
	let div2;
	let div1;
	let t0;
	let div0;
	let button0;
	let t1_value = (/*pngBusy*/ ctx[9] ? 'Saving…' : 'Save image') + "";
	let t1;
	let t2;
	let button1;
	let t4;
	let button2;
	let t6;
	let button3;
	let t8;
	let t9;
	let div2_style_value;
	let mounted;
	let dispose;
	let if_block0 = !/*embedded*/ ctx[1] && create_if_block_6$2(ctx);
	let if_block1 = !/*embedded*/ ctx[1] && create_if_block_5$2(ctx);

	function select_block_type(ctx, dirty) {
		if (/*sounding*/ ctx[3]) return create_if_block$2;
		return create_else_block$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block2 = current_block_type(ctx);

	return {
		c() {
			div2 = element("div");
			div1 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			button0 = element("button");
			t1 = text(t1_value);
			t2 = space();
			button1 = element("button");
			button1.textContent = "−";
			t4 = space();
			button2 = element("button");
			button2.textContent = "Fit";
			t6 = space();
			button3 = element("button");
			button3.textContent = "+";
			t8 = space();
			if (if_block1) if_block1.c();
			t9 = space();
			if_block2.c();
			attr(button0, "class", "png svelte-1jsw3cb");
			attr(button0, "type", "button");
			button0.disabled = /*pngBusy*/ ctx[9];
			attr(button1, "type", "button");
			attr(button1, "title", "Zoom out");
			attr(button1, "aria-label", "Zoom out");
			attr(button1, "class", "svelte-1jsw3cb");
			attr(button2, "class", "zoom-readout svelte-1jsw3cb");
			attr(button2, "type", "button");
			attr(button2, "title", "Fit sounding");
			attr(button2, "aria-label", "Fit sounding");
			attr(button3, "type", "button");
			attr(button3, "title", "Zoom in");
			attr(button3, "aria-label", "Zoom in");
			attr(button3, "class", "svelte-1jsw3cb");
			attr(div0, "class", "actions svelte-1jsw3cb");
			attr(div1, "class", "head svelte-1jsw3cb");
			toggle_class(div1, "embedded-head", /*embedded*/ ctx[1]);
			attr(div2, "class", "sounding-shell svelte-1jsw3cb");
			attr(div2, "role", "group");
			attr(div2, "aria-label", "Forecast sounding");

			attr(div2, "style", div2_style_value = /*embedded*/ ctx[1]
			? undefined
			: `left:${/*position*/ ctx[7].x}px;top:${/*position*/ ctx[7].y}px;`);

			toggle_class(div2, "sounding-embedded", /*embedded*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div1);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t0);
			append(div1, div0);
			append(div0, button0);
			append(button0, t1);
			append(div0, t2);
			append(div0, button1);
			append(div0, t4);
			append(div0, button2);
			append(div0, t6);
			append(div0, button3);
			append(div0, t8);
			if (if_block1) if_block1.m(div0, null);
			append(div2, t9);
			if_block2.m(div2, null);
			/*div2_binding*/ ctx[31](div2);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*downloadPng*/ ctx[22]),
					listen(button1, "click", /*click_handler*/ ctx[26]),
					listen(button2, "click", /*resetZoom*/ ctx[15]),
					listen(button3, "click", /*click_handler_1*/ ctx[27])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (!/*embedded*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_6$2(ctx);
					if_block0.c();
					if_block0.m(div1, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*pngBusy*/ 512 && t1_value !== (t1_value = (/*pngBusy*/ ctx[9] ? 'Saving…' : 'Save image') + "")) set_data(t1, t1_value);

			if (dirty[0] & /*pngBusy*/ 512) {
				button0.disabled = /*pngBusy*/ ctx[9];
			}

			if (!/*embedded*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_5$2(ctx);
					if_block1.c();
					if_block1.m(div0, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*embedded*/ 2) {
				toggle_class(div1, "embedded-head", /*embedded*/ ctx[1]);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(div2, null);
				}
			}

			if (dirty[0] & /*embedded, position*/ 130 && div2_style_value !== (div2_style_value = /*embedded*/ ctx[1]
			? undefined
			: `left:${/*position*/ ctx[7].x}px;top:${/*position*/ ctx[7].y}px;`)) {
				attr(div2, "style", div2_style_value);
			}

			if (dirty[0] & /*embedded*/ 2) {
				toggle_class(div2, "sounding-embedded", /*embedded*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div2);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_block2.d();
			/*div2_binding*/ ctx[31](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3.5;

function clampZoom(value) {
	return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function instance$3($$self, $$props, $$invalidate) {
	let sounding;
	let validLabel;
	let { point } = $$props;
	let { terrainM = null } = $$props;
	let { placeName = '' } = $$props;
	let { embedded = false } = $$props;
	let { units = 'metric' } = $$props;
	const dispatch = createEventDispatcher();
	let timestamp = Date.now();
	let timestampListener = null;
	let shell = null;
	let svgEl = null;
	let viewport = null;
	let position = { x: 24, y: 64 };
	let dragPointerId = null;
	let dragOffset = { x: 0, y: 0 };
	let zoom = 1;
	let pngBusy = false;
	const plotPointers = new Map();
	let panPointerId = null;
	let panStart = { x: 0, y: 0, left: 0, top: 0 };
	let pinchDistance = 0;
	let hoverNode = null;

	function formatValid(p, target) {
		if (!p?.times?.length) return 'Selected forecast time';
		const index = forecastIntervalIndex(p.times, target);
		if (index < 0) return 'Forecast time unavailable';
		const t = p.times[index];

		return new Date(t).toLocaleString(undefined, {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function clampPosition(x, y) {
		const rect = shell?.getBoundingClientRect();
		const w = rect?.width ?? 390, h = rect?.height ?? 520;

		return {
			x: Math.max(6, Math.min(window.innerWidth - w - 6, x)),
			y: Math.max(6, Math.min(window.innerHeight - h - 6, y))
		};
	}

	function startDrag(event) {
		if (!shell) return;
		dragPointerId = event.pointerId;
		const rect = shell.getBoundingClientRect();

		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};

		window.addEventListener('pointermove', dragMove);
		window.addEventListener('pointerup', stopDrag, { once: true });
		event.preventDefault();
	}

	function dragMove(event) {
		if (event.pointerId === dragPointerId) $$invalidate(7, position = clampPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y));
	}

	function stopDrag(event) {
		if (event.pointerId === dragPointerId) dragPointerId = null;
		window.removeEventListener('pointermove', dragMove);
	}

	function zoomAround(value, clientX, clientY) {
		if (!viewport) {
			$$invalidate(8, zoom = clampZoom(value));
			return;
		}

		const next = clampZoom(value), old = zoom;
		if (Math.abs(next - old) < 0.002) return;
		const rect = viewport.getBoundingClientRect();

		const anchorX = clientX === undefined
		? rect.width / 2
		: Math.max(0, Math.min(rect.width, clientX - rect.left));

		const anchorY = clientY === undefined
		? rect.height / 2
		: Math.max(0, Math.min(rect.height, clientY - rect.top));

		const contentX = (viewport.scrollLeft + anchorX) / old;
		const contentY = (viewport.scrollTop + anchorY) / old;
		$$invalidate(8, zoom = next);

		requestAnimationFrame(() => {
			if (!viewport) return;
			$$invalidate(6, viewport.scrollLeft = Math.max(0, contentX * next - anchorX), viewport);
			$$invalidate(6, viewport.scrollTop = Math.max(0, contentY * next - anchorY), viewport);
		});
	}

	function zoomAtCentre(value) {
		zoomAround(value);
	}

	function resetZoom() {
		$$invalidate(8, zoom = 1);

		requestAnimationFrame(() => {
			if (viewport) {
				$$invalidate(6, viewport.scrollLeft = 0, viewport);
				$$invalidate(6, viewport.scrollTop = 0, viewport);
			}
		});
	}

	function handleWheel(event) {
		const factor = Math.exp(-event.deltaY * 0.00135);
		zoomAround(zoom * factor, event.clientX, event.clientY);
	}

	function pointerDistance() {
		const pts = [...plotPointers.values()];

		return pts.length < 2
		? 0
		: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
	}

	function pointerCentre() {
		const pts = [...plotPointers.values()];
		if (pts.length < 2) return null;

		return {
			x: (pts[0].x + pts[1].x) / 2,
			y: (pts[0].y + pts[1].y) / 2
		};
	}

	function startPlotPointer(event) {
		if (!viewport || event.pointerType === 'mouse' && event.button !== 0) return;
		inspectPointer(event);
		plotPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		try {
			viewport.setPointerCapture(event.pointerId);
		} catch {
			
		}

		if (plotPointers.size === 1) {
			panPointerId = event.pointerId;

			panStart = {
				x: event.clientX,
				y: event.clientY,
				left: viewport.scrollLeft,
				top: viewport.scrollTop
			};
		} else if (plotPointers.size === 2) {
			panPointerId = null;
			pinchDistance = pointerDistance();
		}
	}

	function inspectPointer(event) {
		if (!svgEl || !viewport || !sounding?.nodes?.length) return;
		const rect = svgEl.getBoundingClientRect();
		const sx = (event.clientX - rect.left) / Math.max(1, rect.width) * 330;
		const sy = (event.clientY - rect.top) / Math.max(1, rect.height) * 390;

		if (sx < 48 || sx > 310 || sy < 22 || sy > 342) {
			if (!plotPointers.size) $$invalidate(10, hoverNode = null);
			return;
		}

		let nearest = sounding.nodes[0], distance = Math.abs(nearest.y - sy);

		for (let i = 1; i < sounding.nodes.length; i++) {
			const d = Math.abs(sounding.nodes[i].y - sy);

			if (d < distance) {
				nearest = sounding.nodes[i];
				distance = d;
			}
		}

		$$invalidate(10, hoverNode = { ...nearest });
	}

	function leavePlot() {
		if (!plotPointers.size) $$invalidate(10, hoverNode = null);
	}

	function movePlotPointer(event) {
		inspectPointer(event);
		if (!viewport || !plotPointers.has(event.pointerId)) return;
		plotPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (plotPointers.size >= 2) {
			const distance = pointerDistance(), centre = pointerCentre();
			if (pinchDistance > 0 && distance > 0 && centre) zoomAround(zoom * (distance / pinchDistance), centre.x, centre.y);
			pinchDistance = distance;
			event.preventDefault();
			return;
		}

		if (panPointerId === event.pointerId && zoom > 1.001) {
			$$invalidate(6, viewport.scrollLeft = panStart.left - (event.clientX - panStart.x), viewport);
			$$invalidate(6, viewport.scrollTop = panStart.top - (event.clientY - panStart.y), viewport);
			event.preventDefault();
		}
	}

	function endPlotPointer(event) {
		plotPointers.delete(event.pointerId);

		try {
			viewport?.releasePointerCapture(event.pointerId);
		} catch {
			
		}

		if (plotPointers.size < 2) pinchDistance = 0;
		if (panPointerId === event.pointerId) panPointerId = null;

		if (plotPointers.size === 1 && viewport) {
			const [id, p] = [...plotPointers.entries()][0];
			panPointerId = id;

			panStart = {
				x: p.x,
				y: p.y,
				left: viewport.scrollLeft,
				top: viewport.scrollTop
			};
		}
	}

	function handleViewportKey(event) {
		if (event.key === '+' || event.key === '=') {
			event.preventDefault();
			zoomAtCentre(zoom * 1.25);
		} else if (event.key === '-') {
			event.preventDefault();
			zoomAtCentre(zoom / 1.25);
		} else if (event.key === '0' || event.key === 'Escape') {
			event.preventDefault();
			resetZoom();
		}
	}

	async function downloadPng() {
		if (!svgEl || pngBusy) return;
		$$invalidate(9, pngBusy = true);

		try {
			const clone = svgEl.cloneNode(true);
			clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			clone.setAttribute('width', '1320');
			clone.setAttribute('height', '1560');
			const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
			style.textContent = 'text{font-family:Arial,sans-serif}.plot-bg{fill:#0d171d;stroke:#263a46}.terrain-zone{fill:#392716;opacity:.32}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-text{fill:#ffbd75;font-size:7px}.snowline-marker{stroke:#69d4ff;stroke-width:1.5;stroke-dasharray:4 3}.snowline-tag-bg{fill:#102b36}.snowline-tag{fill:#aeeaff;font-size:7px;font-weight:700}.temp-grid{stroke:#2a3c46}.temp-grid.zero{stroke:#75caef;stroke-width:1.3}.pressure-grid{stroke:#2a3c46}.axis{fill:#94a7b1;font-size:7px}.temp-line{fill:none;stroke:#ff765f;stroke-width:2.4}.dew-line{fill:none;stroke:#72d98b;stroke-width:2.1}.wetbulb-line{fill:none;stroke:#69d4ff;stroke-width:1.7;stroke-dasharray:4 3}.temp-dot{fill:#ff765f}.dew-dot{fill:#72d98b}';
			clone.insertBefore(style, clone.firstChild);
			const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob), img = new Image();

			await new Promise((resolve, reject) => {
					img.onload = () => resolve();
					img.onerror = () => reject(new Error('Sounding image failed'));
					img.src = url;
				});

			const canvas = document.createElement('canvas');
			canvas.width = 1320;
			canvas.height = 1760;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('No canvas');
			ctx.fillStyle = '#0b141a';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = '#fff';
			ctx.font = '700 48px Arial';
			ctx.fillText('Wintry forecast · sounding', 54, 70);
			ctx.fillStyle = '#c3d0d7';
			ctx.font = '26px Arial';
			ctx.fillText(placeName || 'Selected point', 54, 112);
			ctx.fillStyle = '#6ecdf2';
			ctx.font = '22px Arial';
			ctx.fillText(validLabel, 54, 148);
			ctx.drawImage(img, 0, 170, 1320, 1560);
			URL.revokeObjectURL(url);
			const png = await new Promise((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('PNG failed')), 'image/png'));
			const href = URL.createObjectURL(png), a = document.createElement('a');
			a.href = href;
			a.download = `wintry-sounding-${(placeName || 'point').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(href), 30000);
		} catch(e) {
			console.warn('Wintry forecast sounding PNG failed', e);
		} finally {
			$$invalidate(9, pngBusy = false);
		}
	}

	function buildSounding(p, terrain, target, units) {
		if (!p?.times?.length) return null;
		const idx = forecastIntervalIndex(p.times, target);
		if (idx < 0) return null;
		let profile;

		try {
			profile = buildProfile(p.forecast, idx).filter(v => Number.isFinite(v.heightM) && Number.isFinite(v.tempC) && Number.isFinite(v.dewpointC) && Number.isFinite(v.wetBulbC)).sort((a, b) => a.heightM - b.heightM);
		} catch {
			return null;
		}

		if (profile.length < 3) return null;

		const bottomH = Math.min(...profile.map(v => v.heightM)),
			topH = Math.max(...profile.map(v => v.heightM));

		const temps = profile.flatMap(v => [v.tempC, v.dewpointC, v.wetBulbC]);

		let minT = Math.floor((Math.min(...temps) - 4) / 10) * 10,
			maxT = Math.ceil((Math.max(...temps) + 4) / 10) * 10;

		minT = Math.min(minT, -20);
		maxT = Math.max(maxT, 10);
		if (maxT - minT < 40) maxT = minT + 40;
		const x = t => 48 + (t - minT) / Math.max(1, maxT - minT) * 262;
		const y = h => 342 - (h - bottomH) / Math.max(1, topH - bottomH) * 320;
		const tempPoints = profile.map(v => `${x(v.tempC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');
		const dewPoints = profile.map(v => `${x(v.dewpointC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');
		const wetBulbPoints = profile.map(v => `${x(v.wetBulbC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');

		const nodes = profile.map(v => ({
			tx: x(v.tempC),
			dx: x(v.dewpointC),
			wx: x(v.wetBulbC),
			y: y(v.heightM),
			pressure: v.pressureHpa,
			height: v.heightM,
			temp: v.tempC,
			dew: v.dewpointC,
			wet: v.wetBulbC
		}));

		const tempGrid = [];
		for (let t = Math.ceil(minT / 10) * 10; t <= maxT; t += 10) tempGrid.push({ x: x(t), value: t });
		const pressureLevels = [1000, 925, 850, 700, 500, 300, 200];

		const pressureGrid = profile.filter(node => pressureLevels.includes(node.pressureHpa)).map(node => ({
			y: y(node.heightM),
			label: String(node.pressureHpa)
		}));

		const terrainY = terrain !== null && Number.isFinite(terrain) && terrain >= bottomH && terrain <= topH
		? y(terrain)
		: null;

		const wbz = wetBulbZeroHeight(profile);

		const snowlineM = wbz.snowLevelM !== null && Number.isFinite(wbz.snowLevelM)
		? wbz.snowLevelM
		: null;

		const snowlineY = snowlineM !== null && snowlineM >= bottomH && snowlineM <= topH
		? y(snowlineM)
		: null;

		const precip = precipMmAt(p.forecast, idx);
		const hasPrecip = precip !== null && precip >= PRECIP_THRESHOLD_MM_H;

		const diagnostics = terrain !== null && Number.isFinite(terrain)
		? terrainDiagnostics(profile, terrain)
		: null;

		const phase = hasPrecip && terrain !== null && Number.isFinite(terrain)
		? terrainPrecipitationType(profile, terrain)
		: null;

		return {
			tempPoints,
			dewPoints,
			wetBulbPoints,
			nodes,
			tempGrid,
			pressureGrid,
			terrainY,
			snowlineY,
			surfaceTw: diagnostics
			? `${diagnostics.extrapolated ? '~' : ''}${formatTemperature(diagnostics.wetBulbC, units)}`
			: '—',
			snowline: snowlineM === null
			? 'Unresolved'
			: (wbz.extrapolated ? '~ ' : '') + formatElevation(snowlineM, units),
			warmEnergy: phase
			? `${Math.round(phase.meltingDegreeMetres)} °C·m`
			: '—',
			coldEnergy: phase
			? `${Math.round(phase.refreezingDegreeMetres)} °C·m`
			: '—',
			phaseLabel: phase
			? `${phase.icon} ${precipitationLabel(phase)}`
			: conditionLabel(precip, phase),
			phaseDetail: phase ? phase.detail : conditionLabel(precip, phase),
			phaseKey: phase?.key ?? null
		};
	}

	onMount(() => {
		if (!embedded) {
			const width = Math.min(390, window.innerWidth - 12);

			$$invalidate(7, position = {
				x: Math.max(6, window.innerWidth - width - 16),
				y: window.innerWidth <= 520 ? 38 : 66
			});
		}

		try {
			const t = store.get('timestamp');
			if (typeof t === 'number') $$invalidate(25, timestamp = t);

			timestampListener = store.on('timestamp', v => {
				const n = Number(v);
				if (Number.isFinite(n)) $$invalidate(25, timestamp = n);
			});
		} catch {
			
		}
	});

	onDestroy(() => {
		plotPointers.clear();
		window.removeEventListener('pointermove', dragMove);
		window.removeEventListener('pointerup', stopDrag);

		if (timestampListener !== null) try {
			store.off(timestampListener);
		} catch {
			
		}
	});

	const click_handler = () => zoomAtCentre(zoom / 1.25);
	const click_handler_1 = () => zoomAtCentre(zoom * 1.25);
	const click_handler_2 = () => dispatch('close');

	function svg_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			svgEl = $$value;
			$$invalidate(5, svgEl);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			viewport = $$value;
			$$invalidate(6, viewport);
		});
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			shell = $$value;
			$$invalidate(4, shell);
		});
	}

	$$self.$$set = $$props => {
		if ('point' in $$props) $$invalidate(23, point = $$props.point);
		if ('terrainM' in $$props) $$invalidate(24, terrainM = $$props.terrainM);
		if ('placeName' in $$props) $$invalidate(0, placeName = $$props.placeName);
		if ('embedded' in $$props) $$invalidate(1, embedded = $$props.embedded);
		if ('units' in $$props) $$invalidate(2, units = $$props.units);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*point, terrainM, timestamp, units*/ 58720260) {
			$$invalidate(3, sounding = buildSounding(point, terrainM, timestamp, units));
		}

		if ($$self.$$.dirty[0] & /*sounding*/ 8) {
			{
				$$invalidate(10, hoverNode = null);
			}
		}

		if ($$self.$$.dirty[0] & /*point, timestamp*/ 41943040) {
			$$invalidate(11, validLabel = formatValid(point, timestamp));
		}
	};

	return [
		placeName,
		embedded,
		units,
		sounding,
		shell,
		svgEl,
		viewport,
		position,
		zoom,
		pngBusy,
		hoverNode,
		validLabel,
		dispatch,
		startDrag,
		zoomAtCentre,
		resetZoom,
		handleWheel,
		startPlotPointer,
		leavePlot,
		movePlotPointer,
		endPlotPointer,
		handleViewportKey,
		downloadPng,
		point,
		terrainM,
		timestamp,
		click_handler,
		click_handler_1,
		click_handler_2,
		svg_binding,
		div1_binding,
		div2_binding
	];
}

class SoundingChart extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$3,
			create_fragment$3,
			safe_not_equal,
			{
				point: 23,
				terrainM: 24,
				placeName: 0,
				embedded: 1,
				units: 2
			},
			add_css$2,
			[-1, -1]
		);
	}
}

/* src\SnowlineChart.svelte generated by Svelte v4.2.20 */

function add_css$1(target) {
	append_styles(target, "svelte-1q22nou", ".chart-shell.svelte-1q22nou.svelte-1q22nou{position:fixed;z-index:10020;width:min(430px, calc(100vw - 16px));padding:11px 12px 10px;border:1px solid rgba(98, 213, 255, 0.35);border-radius:14px;background:linear-gradient(180deg, rgba(15, 24, 31, 0.99), rgba(9, 17, 23, 0.99));color:white;box-shadow:0 16px 42px rgba(0, 0, 0, 0.56);backdrop-filter:blur(6px)}.chart-head.svelte-1q22nou.svelte-1q22nou{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.chart-title.svelte-1q22nou.svelte-1q22nou{min-width:0;flex:1}.chart-title.svelte-1q22nou b.svelte-1q22nou{display:block;font-size:15px}.chart-title.svelte-1q22nou small.svelte-1q22nou,.chart-title.svelte-1q22nou em.svelte-1q22nou{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.chart-title.svelte-1q22nou small.svelte-1q22nou{margin-top:3px;color:#a5b4bd;font-size:9px}.chart-title.svelte-1q22nou em.svelte-1q22nou{margin-top:2px;color:#70cef4;font-size:8px}.chart-actions.svelte-1q22nou.svelte-1q22nou{display:flex;gap:4px}.chart-actions.svelte-1q22nou button.svelte-1q22nou{height:26px;min-width:26px;padding:0 7px;border:1px solid rgba(255, 255, 255, 0.08);border-radius:7px;background:rgba(255, 255, 255, 0.075);color:#fff;font-size:12px;font-weight:800;cursor:pointer}.chart-actions.svelte-1q22nou button.svelte-1q22nou:hover{background:rgba(98, 213, 255, 0.15)}.png-button.svelte-1q22nou.svelte-1q22nou{font-size:8px !important}.drag-button.svelte-1q22nou.svelte-1q22nou{cursor:grab!important;touch-action:none}.forecast-tabs.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;padding:3px;border-radius:8px;background:rgba(255, 255, 255, 0.035)}.forecast-tabs.svelte-1q22nou button.svelte-1q22nou{height:27px;border:0;border-radius:6px;background:transparent;color:#82939d;font-size:9px;font-weight:800;cursor:pointer}.forecast-tabs.svelte-1q22nou button.active.svelte-1q22nou{background:rgba(98, 213, 255, 0.13);color:#eaf7fc;box-shadow:inset 0 0 0 1px rgba(98, 213, 255, 0.22)}.plot-wrap.svelte-1q22nou.svelte-1q22nou{position:relative;margin-top:5px}svg.svelte-1q22nou.svelte-1q22nou{display:block;width:100%;height:auto;overflow:visible;touch-action:none}.plot-bg.svelte-1q22nou.svelte-1q22nou,.band-bg.svelte-1q22nou.svelte-1q22nou{fill:rgba(255, 255, 255, 0.022);stroke:rgba(104, 151, 177, 0.22);stroke-width:1}.terrain-zone.svelte-1q22nou.svelte-1q22nou{fill:rgba(55, 190, 232, 0.085)}.grid.svelte-1q22nou.svelte-1q22nou{stroke:rgba(160, 196, 216, 0.13)}.axis.svelte-1q22nou.svelte-1q22nou{fill:#8fa1ac;font-size:8px;font-family:sans-serif}.section-label.svelte-1q22nou.svelte-1q22nou{fill:#cbd8df;font-size:6.8px;font-family:sans-serif;font-weight:800;letter-spacing:0.35px}.section-label.svelte-1q22nou tspan.svelte-1q22nou{fill:#657681;font-weight:500}.snowline-title.svelte-1q22nou.svelte-1q22nou{fill:#cfeefb}.precip-title.svelte-1q22nou.svelte-1q22nou,.precip-axis.svelte-1q22nou.svelte-1q22nou{fill:#64d4f5}.phase-title.svelte-1q22nou.svelte-1q22nou{fill:#d9c75e}.snow-title.svelte-1q22nou.svelte-1q22nou,.snow-axis.svelte-1q22nou.svelte-1q22nou{fill:#82e398}.terrain-line.svelte-1q22nou.svelte-1q22nou{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-tag.svelte-1q22nou.svelte-1q22nou{fill:#ffbd75;font-size:6px;font-family:sans-serif}.snowline-line.svelte-1q22nou.svelte-1q22nou{fill:none;stroke:#65d5ff;stroke-width:2.7;stroke-linecap:round;stroke-linejoin:round}.min24-line.svelte-1q22nou.svelte-1q22nou{stroke:#9fe9ff;stroke-width:1;stroke-dasharray:2 3}.min24-dot.svelte-1q22nou.svelte-1q22nou{fill:#0d151b;stroke:#9fe9ff;stroke-width:2}.min24-tag.svelte-1q22nou.svelte-1q22nou{fill:#bdefff;font-size:5.8px;font-family:sans-serif;font-weight:800}.now-line.svelte-1q22nou.svelte-1q22nou{stroke:#ff6658;stroke-width:1.25}.now-tag-bg.svelte-1q22nou.svelte-1q22nou{fill:#ff6658}.now-tag.svelte-1q22nou.svelte-1q22nou{fill:#fff;font-size:7px;font-family:sans-serif;font-weight:800}.cursor.svelte-1q22nou.svelte-1q22nou{stroke:#b9c6cd;stroke-width:1;stroke-dasharray:2 3}.current-dot.svelte-1q22nou.svelte-1q22nou{fill:#fff;stroke:#65d5ff;stroke-width:2.3}.crossing-line.svelte-1q22nou.svelte-1q22nou{stroke:#ffe05b;stroke-width:1.3;stroke-dasharray:3 3;cursor:pointer}.crossing-dot.svelte-1q22nou.svelte-1q22nou{fill:#12191f;stroke:#ffe05b;stroke-width:2.1;cursor:pointer}.inspect-line.svelte-1q22nou.svelte-1q22nou{stroke:#83939d}.precip-bar.svelte-1q22nou.svelte-1q22nou{fill:#3f9fbe;opacity:0.72}.precip-bar.wet.svelte-1q22nou.svelte-1q22nou{fill:#67d6f5;opacity:0.96}.phase-base.svelte-1q22nou.svelte-1q22nou{fill:#0b1419}.phase-block.svelte-1q22nou.svelte-1q22nou{opacity:0.94}.phase-snow.svelte-1q22nou.svelte-1q22nou{fill:#b2b2b2}.phase-wet-snow.svelte-1q22nou.svelte-1q22nou{fill:#569456}.phase-mix.svelte-1q22nou.svelte-1q22nou{fill:#95a109}.phase-rain.svelte-1q22nou.svelte-1q22nou{fill:#0099b6}.phase-ice-pellets.svelte-1q22nou.svelte-1q22nou{fill:#510c0f}.phase-freezing-rain.svelte-1q22nou.svelte-1q22nou{fill:#900096}.phase-legend-svg.svelte-1q22nou text.svelte-1q22nou{fill:#d4dfe6;font-size:9px;font-family:sans-serif}.new-snow-area.svelte-1q22nou.svelte-1q22nou{fill:#82e398;opacity:0.16}.new-snow-line.svelte-1q22nou.svelte-1q22nou{fill:none;stroke:#82e398;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.empty-band.svelte-1q22nou.svelte-1q22nou{fill:#778993;font-size:7px;font-family:sans-serif}.tooltip.svelte-1q22nou.svelte-1q22nou{position:absolute;z-index:4;min-width:176px;transform:translateX(-50%);padding:7px 9px;border-radius:9px;background:rgba(5, 12, 17, 0.99);border:1px solid rgba(98, 213, 255, 0.25);box-shadow:0 7px 20px rgba(0, 0, 0, 0.44);pointer-events:none}.tooltip.svelte-1q22nou>b.svelte-1q22nou{display:block;font-size:8.8px}.tooltip.svelte-1q22nou>strong.svelte-1q22nou{display:flex;align-items:center;gap:5px;margin:4px 0 5px;font-size:9.2px}.tip-phase-dot.svelte-1q22nou.svelte-1q22nou,.current-phase-dot.svelte-1q22nou.svelte-1q22nou{display:inline-block;width:8px;height:8px;border-radius:2px;flex:0 0 auto}.tip-grid.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:1fr 1fr;gap:4px 9px}.tip-grid.svelte-1q22nou span.svelte-1q22nou{font-size:7.3px;color:#8fa0aa}.tip-grid.svelte-1q22nou b.svelte-1q22nou{color:#eaf3f7;font-weight:800}.text-snow.svelte-1q22nou.svelte-1q22nou{color:#b2b2b2}.text-wet-snow.svelte-1q22nou.svelte-1q22nou{color:#569456}.text-mix.svelte-1q22nou.svelte-1q22nou{color:#95a109}.text-rain.svelte-1q22nou.svelte-1q22nou{color:#0099b6}.text-ice-pellets.svelte-1q22nou.svelte-1q22nou{color:#510c0f;text-shadow:0 0 1px #fff}.text-freezing-rain.svelte-1q22nou.svelte-1q22nou{color:#900096}.current-card.svelte-1q22nou.svelte-1q22nou{margin-top:3px;padding:7px;border:1px solid rgba(255, 255, 255, 0.07);border-left:3px solid rgba(255, 255, 255, 0.28);border-radius:9px;background:rgba(255, 255, 255, 0.028)}.active-snow.svelte-1q22nou.svelte-1q22nou{border-left-color:#b2b2b2}.active-wet-snow.svelte-1q22nou.svelte-1q22nou{border-left-color:#569456}.active-mix.svelte-1q22nou.svelte-1q22nou{border-left-color:#95a109}.active-rain.svelte-1q22nou.svelte-1q22nou{border-left-color:#0099b6}.active-ice-pellets.svelte-1q22nou.svelte-1q22nou{border-left-color:#510c0f}.active-freezing-rain.svelte-1q22nou.svelte-1q22nou{border-left-color:#900096}.current-type.svelte-1q22nou.svelte-1q22nou{text-align:center}.current-type.svelte-1q22nou b.svelte-1q22nou{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px}.current-type.svelte-1q22nou strong.svelte-1q22nou{display:block;margin-top:3px;color:#81dfff;font-size:7.3px}.metrics.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:repeat(2, 1fr);gap:4px;margin-top:6px}.metrics.svelte-1q22nou span.svelte-1q22nou{padding:5px 2px;border-radius:7px;background:rgba(255, 255, 255, 0.035);text-align:center;min-width:0}.metrics.svelte-1q22nou small.svelte-1q22nou{display:block;color:#7f909a;font-size:5.8px}.metrics.svelte-1q22nou b.svelte-1q22nou{display:block;margin-top:1px;font-size:7px;white-space:nowrap}.outlook24.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;margin-top:6px;padding:6px 8px;border-radius:8px;background:rgba(98, 213, 255, 0.06);border:1px solid rgba(98, 213, 255, 0.11)}.outlook24.svelte-1q22nou>b.svelte-1q22nou{grid-row:0.33333333;color:#8fdfff;font-size:7px;text-transform:uppercase;letter-spacing:0.3px}.outlook24.svelte-1q22nou span.svelte-1q22nou{color:#dceaf0;font-size:7.5px;font-weight:700}.outlook24.svelte-1q22nou button.svelte-1q22nou{justify-self:start;padding:2px 0;border:0;background:transparent;color:#f1d67d;font-size:7px;font-weight:800;cursor:pointer}.outlook24.svelte-1q22nou button.svelte-1q22nou:hover{color:#fff2ae;text-decoration:underline}.note.svelte-1q22nou.svelte-1q22nou{margin-top:4px;color:#d7bc4e;font-size:7.2px;text-align:center}.hint.svelte-1q22nou.svelte-1q22nou{margin-top:5px;color:#66757e;font-size:6.7px;text-align:center}.empty.svelte-1q22nou.svelte-1q22nou{padding:25px 8px;text-align:center;color:#8a9aa4;font-size:10px}@media(max-width: 520px){.chart-shell.svelte-1q22nou.svelte-1q22nou{width:calc(100vw - 12px);padding:9px;border-radius:12px}.png-button.svelte-1q22nou.svelte-1q22nou{display:none !important}.chart-title.svelte-1q22nou small.svelte-1q22nou,.chart-title.svelte-1q22nou em.svelte-1q22nou{max-width:180px}.metrics.svelte-1q22nou.svelte-1q22nou{gap:3px}.metrics.svelte-1q22nou small.svelte-1q22nou{font-size:5.3px}.metrics.svelte-1q22nou b.svelte-1q22nou{font-size:6.4px}.tooltip.svelte-1q22nou.svelte-1q22nou{min-width:158px}.outlook24.svelte-1q22nou span.svelte-1q22nou,.outlook24.svelte-1q22nou button.svelte-1q22nou{font-size:6.6px}}.event-head.svelte-1q22nou.svelte-1q22nou,.elevation-head.svelte-1q22nou.svelte-1q22nou{display:flex;align-items:center;justify-content:space-between;gap:8px}.confidence.svelte-1q22nou.svelte-1q22nou{padding:2px 5px;border-radius:8px;font-size:6.5px;font-style:normal;font-weight:850}.confidence-high.svelte-1q22nou.svelte-1q22nou{background:rgba(96, 211, 139, 0.12);color:#87e5aa}.confidence-medium.svelte-1q22nou.svelte-1q22nou{background:rgba(255, 209, 84, 0.12);color:#f5d76d}.confidence-low.svelte-1q22nou.svelte-1q22nou{background:rgba(255, 136, 104, 0.12);color:#ffad96}.event-hazard.svelte-1q22nou.svelte-1q22nou{border-color:rgba(193, 132, 255, 0.38) !important;box-shadow:inset 3px 0 rgba(193, 132, 255, 0.8)}.event-timeline.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;margin-top:3px}.elevation-impact.svelte-1q22nou.svelte-1q22nou{margin-top:6px;padding:7px;border:1px solid rgba(255, 255, 255, 0.08);border-radius:8px;background:rgba(255, 255, 255, 0.025)}.impact-band.svelte-1q22nou.svelte-1q22nou{color:#87a7b7;font-size:6.8px}.impact-band.svelte-1q22nou.svelte-1q22nou{margin-top:3px}.elevation-grid.svelte-1q22nou.svelte-1q22nou{display:grid;grid-template-columns:repeat(5, 1fr);gap:3px;margin-top:5px}.chart-shell.svelte-1q22nou.svelte-1q22nou{box-sizing:border-box;max-height:calc(100dvh - 48px);overflow-y:auto;overscroll-behavior:contain}.chart-head.svelte-1q22nou.svelte-1q22nou{position:sticky;top:-11px;z-index:5;padding:8px 0;background:#101a22}.chart-actions.svelte-1q22nou.svelte-1q22nou{flex-wrap:wrap;justify-content:flex-end}.chart-actions.svelte-1q22nou button.svelte-1q22nou{min-height:32px}.png-button.svelte-1q22nou.svelte-1q22nou{display:inline-block !important;font-size:10px !important}.current-type.svelte-1q22nou b.svelte-1q22nou{font-size:15px}.current-type.svelte-1q22nou strong.svelte-1q22nou{font-size:11px}.metrics.svelte-1q22nou small.svelte-1q22nou{font-size:10px}.metrics.svelte-1q22nou b.svelte-1q22nou{font-size:13px}.outlook24.svelte-1q22nou.svelte-1q22nou{display:flex;flex-direction:column;gap:5px}.outlook24.svelte-1q22nou>b.svelte-1q22nou{font-size:10px}.outlook24.svelte-1q22nou span.svelte-1q22nou,.outlook24.svelte-1q22nou button.svelte-1q22nou{font-size:12px;line-height:1.4}.crossing-action.svelte-1q22nou.svelte-1q22nou{width:100%;margin-top:7px;padding:9px;border:1px solid #35515c;border-radius:8px;background:#172932;color:#b7e6f8;text-align:left;font-size:11px;cursor:pointer}.quality-note.svelte-1q22nou.svelte-1q22nou{margin-top:6px;color:#edc881;font-size:11px;line-height:1.4}.hint.svelte-1q22nou.svelte-1q22nou{font-size:10px;line-height:1.35}.forecast-tabs.svelte-1q22nou button.svelte-1q22nou{height:40px;font-size:13px}.chart-title.svelte-1q22nou small.svelte-1q22nou{font-size:12px}.chart-title.svelte-1q22nou em.svelte-1q22nou{font-size:11px}.chart-actions.svelte-1q22nou button.svelte-1q22nou{min-height:36px;min-width:36px}.tooltip.svelte-1q22nou>b.svelte-1q22nou,.tooltip.svelte-1q22nou>strong.svelte-1q22nou{font-size:12px}.tip-grid.svelte-1q22nou span.svelte-1q22nou{font-size:11px}.current-card.svelte-1q22nou.svelte-1q22nou{padding:12px}.metrics.svelte-1q22nou b.svelte-1q22nou{font-size:18px}.section-label.svelte-1q22nou.svelte-1q22nou{font-size:8px}.terrain-tag.svelte-1q22nou.svelte-1q22nou{font-size:8px}button.svelte-1q22nou.svelte-1q22nou:focus-visible{outline:2px solid #8de4ff;outline-offset:2px}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[45] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[48] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[51] = list[i];
	return child_ctx;
}

// (9:6) {#if tab === 'graph' && showNow}
function create_if_block_22(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Now";
			attr(button, "class", "now-action svelte-1q22nou");
			attr(button, "type", "button");
			attr(button, "title", "Back to now");
			attr(button, "aria-label", "Back to now");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*resetToNow*/ ctx[19]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (10:6) {#if tab === 'graph' && chart}
function create_if_block_21(ctx) {
	let button;
	let t_value = (/*pngBusy*/ ctx[7] ? 'Saving…' : 'Save image') + "";
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t = text(t_value);
			attr(button, "class", "png-button svelte-1q22nou");
			attr(button, "type", "button");
			button.disabled = /*pngBusy*/ ctx[7];
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", /*downloadPng*/ ctx[21]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*pngBusy*/ 128 && t_value !== (t_value = (/*pngBusy*/ ctx[7] ? 'Saving…' : 'Save image') + "")) set_data(t, t_value);

			if (dirty[0] & /*pngBusy*/ 128) {
				button.disabled = /*pngBusy*/ ctx[7];
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (126:2) {:else}
function create_else_block_5(ctx) {
	let soundingchart;
	let current;

	soundingchart = new SoundingChart({
			props: {
				point: /*point*/ ctx[1],
				terrainM: /*terrainM*/ ctx[2],
				placeName: /*placeName*/ ctx[3],
				units: /*units*/ ctx[4],
				embedded: true
			}
		});

	return {
		c() {
			create_component(soundingchart.$$.fragment);
		},
		m(target, anchor) {
			mount_component(soundingchart, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const soundingchart_changes = {};
			if (dirty[0] & /*point*/ 2) soundingchart_changes.point = /*point*/ ctx[1];
			if (dirty[0] & /*terrainM*/ 4) soundingchart_changes.terrainM = /*terrainM*/ ctx[2];
			if (dirty[0] & /*placeName*/ 8) soundingchart_changes.placeName = /*placeName*/ ctx[3];
			if (dirty[0] & /*units*/ 16) soundingchart_changes.units = /*units*/ ctx[4];
			soundingchart.$set(soundingchart_changes);
		},
		i(local) {
			if (current) return;
			transition_in(soundingchart.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(soundingchart.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(soundingchart, detaching);
		}
	};
}

// (17:2) {#if tab === 'graph'}
function create_if_block$1(ctx) {
	let if_block_anchor;

	function select_block_type_1(ctx, dirty) {
		if (/*chart*/ ctx[12]) return create_if_block_1$1;
		return create_else_block_4;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(if_block_anchor);
			}

			if_block.d(detaching);
		}
	};
}

// (123:2) {:else}
function create_else_block_4(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Wintry forecast unavailable.";
			attr(div, "class", "empty svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (18:2) {#if chart}
function create_if_block_1$1(ctx) {
	let div0;
	let svg;
	let text0;
	let t0;
	let tspan0;
	let t1_value = (/*units*/ ctx[4] === 'imperial' ? 'ft' : 'm') + "";
	let t1;
	let rect0;
	let line0;
	let line1;
	let line2;
	let text1;
	let t2_value = /*chart*/ ctx[12].maxLabel + "";
	let t2;
	let text2;
	let t3_value = /*chart*/ ctx[12].midLabel + "";
	let t3;
	let text3;
	let t4_value = /*chart*/ ctx[12].minLabel + "";
	let t4;
	let path;
	let path_d_value;
	let show_if = !/*chart*/ ctx[12].points.trim();
	let text4;
	let t5;
	let tspan1;
	let t6_value = (/*units*/ ctx[4] === 'imperial' ? 'in/3h' : 'mm/3h') + "";
	let t6;
	let rect1;
	let text5;
	let t7;
	let rect2;
	let g;
	let rect3;
	let text6;
	let t8;
	let rect4;
	let text7;
	let t9;
	let rect5;
	let text8;
	let t10;
	let rect6;
	let text9;
	let t11;
	let rect7;
	let text10;
	let t12;
	let rect8;
	let text11;
	let t13;
	let text12;
	let t14;
	let tspan2;
	let t15_value = (/*units*/ ctx[4] === 'imperial' ? 'est. in' : 'est. cm') + "";
	let t15;
	let rect9;
	let if_block3_anchor;
	let if_block4_anchor;
	let if_block5_anchor;
	let if_block6_anchor;
	let t16;
	let t17;
	let div3;
	let div1;
	let b0;
	let t18;
	let t19;
	let div2;
	let span0;
	let small0;
	let b1;

	let t21_value = (/*chart*/ ctx[12].currentSnowline === null
	? 'WBZ unresolved'
	: formatElevation(/*chart*/ ctx[12].currentSnowline, /*units*/ ctx[4])) + "";

	let t21;
	let t22;
	let span1;
	let small1;
	let b2;
	let t24_value = formatPrecip(/*chart*/ ctx[12].currentPrecip, /*units*/ ctx[4]) + "";
	let t24;
	let t25;
	let div4;
	let b3;

	let t26_value = ((/*event*/ ctx[13]?.activeNow)
	? 'Current wintry period'
	: 'Next wintry period') + "";

	let t26;
	let t27;
	let t28;
	let t29;
	let t30;
	let if_block13_anchor;
	let mounted;
	let dispose;
	let if_block0 = /*chart*/ ctx[12].terrainY !== null && create_if_block_20(ctx);
	let if_block1 = show_if && create_if_block_19();

	function select_block_type_2(ctx, dirty) {
		if (/*chart*/ ctx[12].hasPrecip) return create_if_block_18;
		return create_else_block_3;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block2 = current_block_type(ctx);
	let each_value_1 = ensure_array_like(/*chart*/ ctx[12].phaseBlocks);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	function select_block_type_3(ctx, dirty) {
		if (/*chart*/ ctx[12].newSnowMax > 0.05) return create_if_block_17;
		return create_else_block_2;
	}

	let current_block_type_1 = select_block_type_3(ctx);
	let if_block3 = current_block_type_1(ctx);
	let if_block4 = /*chart*/ ctx[12].nowX !== null && create_if_block_16(ctx);
	let if_block5 = /*chart*/ ctx[12].currentX !== null && /*chart*/ ctx[12].currentY !== null && create_if_block_15(ctx);
	let if_block6 = /*tooltip*/ ctx[11] && create_if_block_14(ctx);
	let each_value = ensure_array_like([24, 48, 72, 96, 120, 144]);
	let each_blocks = [];

	for (let i = 0; i < 6; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	let if_block7 = /*tooltip*/ ctx[11] && create_if_block_11$1(ctx);

	function select_block_type_4(ctx, dirty) {
		if (/*chart*/ ctx[12].currentPhase) return create_if_block_10$1;
		return create_else_block_1;
	}

	let current_block_type_2 = select_block_type_4(ctx);
	let if_block8 = current_block_type_2(ctx);
	let if_block9 = /*chart*/ ctx[12].currentPosition && create_if_block_9$1(ctx);

	function select_block_type_5(ctx, dirty) {
		if (/*event*/ ctx[13]) return create_if_block_5$1;
		return create_else_block$1;
	}

	let current_block_type_3 = select_block_type_5(ctx);
	let if_block10 = current_block_type_3(ctx);
	let if_block11 = /*crossing*/ ctx[6]?.crossingTime !== null && /*crossing*/ ctx[6]?.crossingTime !== undefined && /*crossing*/ ctx[6].crossingTime > /*timestamp*/ ctx[5] && create_if_block_4$1(ctx);
	let if_block12 = /*chart*/ ctx[12].currentPhase?.confidence === 'low' && create_if_block_3$1();
	let if_block13 = /*event*/ ctx[13] && /*chart*/ ctx[12].coverageNote && create_if_block_2$1(ctx);

	return {
		c() {
			div0 = element("div");
			svg = svg_element("svg");
			text0 = svg_element("text");
			t0 = text("SNOWLINE ");
			tspan0 = svg_element("tspan");
			t1 = text(t1_value);
			rect0 = svg_element("rect");
			if (if_block0) if_block0.c();
			line0 = svg_element("line");
			line1 = svg_element("line");
			line2 = svg_element("line");
			text1 = svg_element("text");
			t2 = text(t2_value);
			text2 = svg_element("text");
			t3 = text(t3_value);
			text3 = svg_element("text");
			t4 = text(t4_value);
			path = svg_element("path");
			if (if_block1) if_block1.c();
			text4 = svg_element("text");
			t5 = text("PRECIPITATION ");
			tspan1 = svg_element("tspan");
			t6 = text(t6_value);
			rect1 = svg_element("rect");
			if_block2.c();
			text5 = svg_element("text");
			t7 = text("PRECIPITATION TYPE");
			rect2 = svg_element("rect");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			g = svg_element("g");
			rect3 = svg_element("rect");
			text6 = svg_element("text");
			t8 = text("Snow");
			rect4 = svg_element("rect");
			text7 = svg_element("text");
			t9 = text("Wet snow");
			rect5 = svg_element("rect");
			text8 = svg_element("text");
			t10 = text("Mix");
			rect6 = svg_element("rect");
			text9 = svg_element("text");
			t11 = text("Rain");
			rect7 = svg_element("rect");
			text10 = svg_element("text");
			t12 = text("Ice pellets");
			rect8 = svg_element("rect");
			text11 = svg_element("text");
			t13 = text("Freezing rain");
			text12 = svg_element("text");
			t14 = text("NEW SNOW ");
			tspan2 = svg_element("tspan");
			t15 = text(t15_value);
			rect9 = svg_element("rect");
			if_block3.c();
			if_block3_anchor = empty();
			if (if_block4) if_block4.c();
			if_block4_anchor = empty();
			if (if_block5) if_block5.c();
			if_block5_anchor = empty();
			if (if_block6) if_block6.c();
			if_block6_anchor = empty();

			for (let i = 0; i < 6; i += 1) {
				each_blocks[i].c();
			}

			t16 = space();
			if (if_block7) if_block7.c();
			t17 = space();
			div3 = element("div");
			div1 = element("div");
			b0 = element("b");
			if_block8.c();
			t18 = space();
			if (if_block9) if_block9.c();
			t19 = space();
			div2 = element("div");
			span0 = element("span");
			small0 = element("small");
			small0.textContent = "Snowline";
			b1 = element("b");
			t21 = text(t21_value);
			t22 = space();
			span1 = element("span");
			small1 = element("small");
			small1.textContent = "Precip";
			b2 = element("b");
			t24 = text(t24_value);
			t25 = space();
			div4 = element("div");
			b3 = element("b");
			t26 = text(t26_value);
			t27 = space();
			if_block10.c();
			t28 = space();
			if (if_block11) if_block11.c();
			t29 = space();
			if (if_block12) if_block12.c();
			t30 = space();
			if (if_block13) if_block13.c();
			if_block13_anchor = empty();
			attr(tspan0, "class", "svelte-1q22nou");
			attr(text0, "x", "42");
			attr(text0, "y", "11");
			attr(text0, "class", "section-label snowline-title svelte-1q22nou");
			attr(rect0, "x", "42");
			attr(rect0, "y", "18");
			attr(rect0, "width", "306");
			attr(rect0, "height", "112");
			attr(rect0, "rx", "8");
			attr(rect0, "class", "plot-bg svelte-1q22nou");
			attr(line0, "x1", "42");
			attr(line0, "x2", "348");
			attr(line0, "y1", "18");
			attr(line0, "y2", "18");
			attr(line0, "class", "grid svelte-1q22nou");
			attr(line1, "x1", "42");
			attr(line1, "x2", "348");
			attr(line1, "y1", "74");
			attr(line1, "y2", "74");
			attr(line1, "class", "grid svelte-1q22nou");
			attr(line2, "x1", "42");
			attr(line2, "x2", "348");
			attr(line2, "y1", "130");
			attr(line2, "y2", "130");
			attr(line2, "class", "grid svelte-1q22nou");
			attr(text1, "x", "37");
			attr(text1, "y", "22");
			attr(text1, "text-anchor", "end");
			attr(text1, "class", "axis svelte-1q22nou");
			attr(text2, "x", "37");
			attr(text2, "y", "78");
			attr(text2, "text-anchor", "end");
			attr(text2, "class", "axis svelte-1q22nou");
			attr(text3, "x", "37");
			attr(text3, "y", "134");
			attr(text3, "text-anchor", "end");
			attr(text3, "class", "axis svelte-1q22nou");
			attr(path, "d", path_d_value = /*chart*/ ctx[12].points);
			attr(path, "class", "snowline-line svelte-1q22nou");
			attr(tspan1, "class", "svelte-1q22nou");
			attr(text4, "x", "42");
			attr(text4, "y", "147");
			attr(text4, "class", "section-label precip-title svelte-1q22nou");
			attr(rect1, "x", "42");
			attr(rect1, "y", "153");
			attr(rect1, "width", "306");
			attr(rect1, "height", "36");
			attr(rect1, "rx", "7");
			attr(rect1, "class", "band-bg svelte-1q22nou");
			attr(text5, "x", "42");
			attr(text5, "y", "205");
			attr(text5, "class", "section-label phase-title svelte-1q22nou");
			attr(rect2, "x", "42");
			attr(rect2, "y", "211");
			attr(rect2, "width", "306");
			attr(rect2, "height", "25");
			attr(rect2, "rx", "7");
			attr(rect2, "class", "band-bg phase-base svelte-1q22nou");
			attr(rect3, "x", "42");
			attr(rect3, "y", "244");
			attr(rect3, "width", "7");
			attr(rect3, "height", "7");
			attr(rect3, "rx", "1.5");
			attr(rect3, "class", "phase-snow svelte-1q22nou");
			attr(text6, "x", "53");
			attr(text6, "y", "251");
			attr(text6, "class", "svelte-1q22nou");
			attr(rect4, "x", "145");
			attr(rect4, "y", "244");
			attr(rect4, "width", "7");
			attr(rect4, "height", "7");
			attr(rect4, "rx", "1.5");
			attr(rect4, "class", "phase-wet-snow svelte-1q22nou");
			attr(text7, "x", "156");
			attr(text7, "y", "251");
			attr(text7, "class", "svelte-1q22nou");
			attr(rect5, "x", "246");
			attr(rect5, "y", "244");
			attr(rect5, "width", "7");
			attr(rect5, "height", "7");
			attr(rect5, "rx", "1.5");
			attr(rect5, "class", "phase-mix svelte-1q22nou");
			attr(text8, "x", "257");
			attr(text8, "y", "251");
			attr(text8, "class", "svelte-1q22nou");
			attr(rect6, "x", "42");
			attr(rect6, "y", "258");
			attr(rect6, "width", "7");
			attr(rect6, "height", "7");
			attr(rect6, "rx", "1.5");
			attr(rect6, "class", "phase-rain svelte-1q22nou");
			attr(text9, "x", "53");
			attr(text9, "y", "265");
			attr(text9, "class", "svelte-1q22nou");
			attr(rect7, "x", "145");
			attr(rect7, "y", "258");
			attr(rect7, "width", "7");
			attr(rect7, "height", "7");
			attr(rect7, "rx", "1.5");
			attr(rect7, "class", "phase-ice-pellets svelte-1q22nou");
			attr(text10, "x", "156");
			attr(text10, "y", "265");
			attr(text10, "class", "svelte-1q22nou");
			attr(rect8, "x", "246");
			attr(rect8, "y", "258");
			attr(rect8, "width", "7");
			attr(rect8, "height", "7");
			attr(rect8, "rx", "1.5");
			attr(rect8, "class", "phase-freezing-rain svelte-1q22nou");
			attr(text11, "x", "257");
			attr(text11, "y", "265");
			attr(text11, "class", "svelte-1q22nou");
			attr(g, "class", "phase-legend-svg svelte-1q22nou");
			attr(tspan2, "class", "svelte-1q22nou");
			attr(text12, "x", "42");
			attr(text12, "y", "282");
			attr(text12, "class", "section-label snow-title svelte-1q22nou");
			attr(rect9, "x", "42");
			attr(rect9, "y", "288");
			attr(rect9, "width", "306");
			attr(rect9, "height", "28");
			attr(rect9, "rx", "7");
			attr(rect9, "class", "band-bg svelte-1q22nou");
			attr(svg, "viewBox", "0 0 360 338");
			attr(svg, "role", "img");
			attr(svg, "aria-label", "Terrain-aware wintry forecast through 144 hours");
			attr(svg, "class", "svelte-1q22nou");
			attr(div0, "class", "plot-wrap svelte-1q22nou");
			attr(b0, "class", "svelte-1q22nou");
			attr(div1, "class", "current-type svelte-1q22nou");
			attr(small0, "class", "svelte-1q22nou");
			attr(b1, "class", "svelte-1q22nou");
			attr(span0, "class", "svelte-1q22nou");
			attr(small1, "class", "svelte-1q22nou");
			attr(b2, "class", "svelte-1q22nou");
			attr(span1, "class", "svelte-1q22nou");
			attr(div2, "class", "metrics svelte-1q22nou");
			attr(div3, "class", "current-card svelte-1q22nou");
			toggle_class(div3, "active-snow", /*chart*/ ctx[12].currentPhase?.key === 'snow');
			toggle_class(div3, "active-wet-snow", /*chart*/ ctx[12].currentPhase?.key === 'wet-snow');
			toggle_class(div3, "active-mix", /*chart*/ ctx[12].currentPhase?.key === 'mix');
			toggle_class(div3, "active-rain", /*chart*/ ctx[12].currentPhase?.key === 'rain');
			toggle_class(div3, "active-ice-pellets", /*chart*/ ctx[12].currentPhase?.key === 'ice-pellets');
			toggle_class(div3, "active-freezing-rain", /*chart*/ ctx[12].currentPhase?.key === 'freezing-rain');
			attr(b3, "class", "svelte-1q22nou");
			attr(div4, "class", "outlook24 event-intelligence svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, svg);
			append(svg, text0);
			append(text0, t0);
			append(text0, tspan0);
			append(tspan0, t1);
			append(svg, rect0);
			if (if_block0) if_block0.m(svg, null);
			append(svg, line0);
			append(svg, line1);
			append(svg, line2);
			append(svg, text1);
			append(text1, t2);
			append(svg, text2);
			append(text2, t3);
			append(svg, text3);
			append(text3, t4);
			append(svg, path);
			if (if_block1) if_block1.m(svg, null);
			append(svg, text4);
			append(text4, t5);
			append(text4, tspan1);
			append(tspan1, t6);
			append(svg, rect1);
			if_block2.m(svg, null);
			append(svg, text5);
			append(text5, t7);
			append(svg, rect2);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(svg, null);
				}
			}

			append(svg, g);
			append(g, rect3);
			append(g, text6);
			append(text6, t8);
			append(g, rect4);
			append(g, text7);
			append(text7, t9);
			append(g, rect5);
			append(g, text8);
			append(text8, t10);
			append(g, rect6);
			append(g, text9);
			append(text9, t11);
			append(g, rect7);
			append(g, text10);
			append(text10, t12);
			append(g, rect8);
			append(g, text11);
			append(text11, t13);
			append(svg, text12);
			append(text12, t14);
			append(text12, tspan2);
			append(tspan2, t15);
			append(svg, rect9);
			if_block3.m(svg, null);
			append(svg, if_block3_anchor);
			if (if_block4) if_block4.m(svg, null);
			append(svg, if_block4_anchor);
			if (if_block5) if_block5.m(svg, null);
			append(svg, if_block5_anchor);
			if (if_block6) if_block6.m(svg, null);
			append(svg, if_block6_anchor);

			for (let i = 0; i < 6; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(svg, null);
				}
			}

			/*svg_binding*/ ctx[26](svg);
			append(div0, t16);
			if (if_block7) if_block7.m(div0, null);
			insert(target, t17, anchor);
			insert(target, div3, anchor);
			append(div3, div1);
			append(div1, b0);
			if_block8.m(b0, null);
			append(div1, t18);
			if (if_block9) if_block9.m(div1, null);
			append(div3, t19);
			append(div3, div2);
			append(div2, span0);
			append(span0, small0);
			append(span0, b1);
			append(b1, t21);
			append(div2, t22);
			append(div2, span1);
			append(span1, small1);
			append(span1, b2);
			append(b2, t24);
			insert(target, t25, anchor);
			insert(target, div4, anchor);
			append(div4, b3);
			append(b3, t26);
			append(div4, t27);
			if_block10.m(div4, null);
			insert(target, t28, anchor);
			if (if_block11) if_block11.m(target, anchor);
			insert(target, t29, anchor);
			if (if_block12) if_block12.m(target, anchor);
			insert(target, t30, anchor);
			if (if_block13) if_block13.m(target, anchor);
			insert(target, if_block13_anchor, anchor);

			if (!mounted) {
				dispose = [
					listen(svg, "pointermove", /*handlePointer*/ ctx[20]),
					listen(svg, "pointerdown", /*handlePointer*/ ctx[20]),
					listen(svg, "pointerleave", /*pointerleave_handler*/ ctx[27])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*units*/ 16 && t1_value !== (t1_value = (/*units*/ ctx[4] === 'imperial' ? 'ft' : 'm') + "")) set_data(t1, t1_value);

			if (/*chart*/ ctx[12].terrainY !== null) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_20(ctx);
					if_block0.c();
					if_block0.m(svg, line0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*chart*/ 4096 && t2_value !== (t2_value = /*chart*/ ctx[12].maxLabel + "")) set_data(t2, t2_value);
			if (dirty[0] & /*chart*/ 4096 && t3_value !== (t3_value = /*chart*/ ctx[12].midLabel + "")) set_data(t3, t3_value);
			if (dirty[0] & /*chart*/ 4096 && t4_value !== (t4_value = /*chart*/ ctx[12].minLabel + "")) set_data(t4, t4_value);

			if (dirty[0] & /*chart*/ 4096 && path_d_value !== (path_d_value = /*chart*/ ctx[12].points)) {
				attr(path, "d", path_d_value);
			}

			if (dirty[0] & /*chart*/ 4096) show_if = !/*chart*/ ctx[12].points.trim();

			if (show_if) {
				if (if_block1) ; else {
					if_block1 = create_if_block_19();
					if_block1.c();
					if_block1.m(svg, text4);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*units*/ 16 && t6_value !== (t6_value = (/*units*/ ctx[4] === 'imperial' ? 'in/3h' : 'mm/3h') + "")) set_data(t6, t6_value);

			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(svg, text5);
				}
			}

			if (dirty[0] & /*chart*/ 4096) {
				each_value_1 = ensure_array_like(/*chart*/ ctx[12].phaseBlocks);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(svg, g);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (dirty[0] & /*units*/ 16 && t15_value !== (t15_value = (/*units*/ ctx[4] === 'imperial' ? 'est. in' : 'est. cm') + "")) set_data(t15, t15_value);

			if (current_block_type_1 === (current_block_type_1 = select_block_type_3(ctx)) && if_block3) {
				if_block3.p(ctx, dirty);
			} else {
				if_block3.d(1);
				if_block3 = current_block_type_1(ctx);

				if (if_block3) {
					if_block3.c();
					if_block3.m(svg, if_block3_anchor);
				}
			}

			if (/*chart*/ ctx[12].nowX !== null) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_16(ctx);
					if_block4.c();
					if_block4.m(svg, if_block4_anchor);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (/*chart*/ ctx[12].currentX !== null && /*chart*/ ctx[12].currentY !== null) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_15(ctx);
					if_block5.c();
					if_block5.m(svg, if_block5_anchor);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (/*tooltip*/ ctx[11]) {
				if (if_block6) {
					if_block6.p(ctx, dirty);
				} else {
					if_block6 = create_if_block_14(ctx);
					if_block6.c();
					if_block6.m(svg, if_block6_anchor);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (/*tooltip*/ ctx[11]) {
				if (if_block7) {
					if_block7.p(ctx, dirty);
				} else {
					if_block7 = create_if_block_11$1(ctx);
					if_block7.c();
					if_block7.m(div0, null);
				}
			} else if (if_block7) {
				if_block7.d(1);
				if_block7 = null;
			}

			if (current_block_type_2 === (current_block_type_2 = select_block_type_4(ctx)) && if_block8) {
				if_block8.p(ctx, dirty);
			} else {
				if_block8.d(1);
				if_block8 = current_block_type_2(ctx);

				if (if_block8) {
					if_block8.c();
					if_block8.m(b0, null);
				}
			}

			if (/*chart*/ ctx[12].currentPosition) {
				if (if_block9) {
					if_block9.p(ctx, dirty);
				} else {
					if_block9 = create_if_block_9$1(ctx);
					if_block9.c();
					if_block9.m(div1, null);
				}
			} else if (if_block9) {
				if_block9.d(1);
				if_block9 = null;
			}

			if (dirty[0] & /*chart, units*/ 4112 && t21_value !== (t21_value = (/*chart*/ ctx[12].currentSnowline === null
			? 'WBZ unresolved'
			: formatElevation(/*chart*/ ctx[12].currentSnowline, /*units*/ ctx[4])) + "")) set_data(t21, t21_value);

			if (dirty[0] & /*chart, units*/ 4112 && t24_value !== (t24_value = formatPrecip(/*chart*/ ctx[12].currentPrecip, /*units*/ ctx[4]) + "")) set_data(t24, t24_value);

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-snow", /*chart*/ ctx[12].currentPhase?.key === 'snow');
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-wet-snow", /*chart*/ ctx[12].currentPhase?.key === 'wet-snow');
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-mix", /*chart*/ ctx[12].currentPhase?.key === 'mix');
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-rain", /*chart*/ ctx[12].currentPhase?.key === 'rain');
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-ice-pellets", /*chart*/ ctx[12].currentPhase?.key === 'ice-pellets');
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(div3, "active-freezing-rain", /*chart*/ ctx[12].currentPhase?.key === 'freezing-rain');
			}

			if (dirty[0] & /*event*/ 8192 && t26_value !== (t26_value = ((/*event*/ ctx[13]?.activeNow)
			? 'Current wintry period'
			: 'Next wintry period') + "")) set_data(t26, t26_value);

			if (current_block_type_3 === (current_block_type_3 = select_block_type_5(ctx)) && if_block10) {
				if_block10.p(ctx, dirty);
			} else {
				if_block10.d(1);
				if_block10 = current_block_type_3(ctx);

				if (if_block10) {
					if_block10.c();
					if_block10.m(div4, null);
				}
			}

			if (/*crossing*/ ctx[6]?.crossingTime !== null && /*crossing*/ ctx[6]?.crossingTime !== undefined && /*crossing*/ ctx[6].crossingTime > /*timestamp*/ ctx[5]) {
				if (if_block11) {
					if_block11.p(ctx, dirty);
				} else {
					if_block11 = create_if_block_4$1(ctx);
					if_block11.c();
					if_block11.m(t29.parentNode, t29);
				}
			} else if (if_block11) {
				if_block11.d(1);
				if_block11 = null;
			}

			if (/*chart*/ ctx[12].currentPhase?.confidence === 'low') {
				if (if_block12) ; else {
					if_block12 = create_if_block_3$1();
					if_block12.c();
					if_block12.m(t30.parentNode, t30);
				}
			} else if (if_block12) {
				if_block12.d(1);
				if_block12 = null;
			}

			if (/*event*/ ctx[13] && /*chart*/ ctx[12].coverageNote) {
				if (if_block13) {
					if_block13.p(ctx, dirty);
				} else {
					if_block13 = create_if_block_2$1(ctx);
					if_block13.c();
					if_block13.m(if_block13_anchor.parentNode, if_block13_anchor);
				}
			} else if (if_block13) {
				if_block13.d(1);
				if_block13 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t17);
				detach(div3);
				detach(t25);
				detach(div4);
				detach(t28);
				detach(t29);
				detach(t30);
				detach(if_block13_anchor);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_block2.d();
			destroy_each(each_blocks_1, detaching);
			if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			destroy_each(each_blocks, detaching);
			/*svg_binding*/ ctx[26](null);
			if (if_block7) if_block7.d();
			if_block8.d();
			if (if_block9) if_block9.d();
			if_block10.d();
			if (if_block11) if_block11.d(detaching);
			if (if_block12) if_block12.d(detaching);
			if (if_block13) if_block13.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (23:8) {#if chart.terrainY !== null}
function create_if_block_20(ctx) {
	let rect;
	let rect_y_value;
	let rect_height_value;
	let line;
	let line_y__value;
	let line_y__value_1;
	let text_1;
	let t;
	let text_1_y_value;

	return {
		c() {
			rect = svg_element("rect");
			line = svg_element("line");
			text_1 = svg_element("text");
			t = text("Terrain");
			attr(rect, "x", "42");
			attr(rect, "y", rect_y_value = /*chart*/ ctx[12].terrainY);
			attr(rect, "width", "306");
			attr(rect, "height", rect_height_value = Math.max(0, 130 - /*chart*/ ctx[12].terrainY));
			attr(rect, "class", "terrain-zone svelte-1q22nou");
			attr(line, "x1", "42");
			attr(line, "x2", "348");
			attr(line, "y1", line_y__value = /*chart*/ ctx[12].terrainY);
			attr(line, "y2", line_y__value_1 = /*chart*/ ctx[12].terrainY);
			attr(line, "class", "terrain-line svelte-1q22nou");
			attr(text_1, "x", "344");
			attr(text_1, "y", text_1_y_value = Math.max(27, /*chart*/ ctx[12].terrainY - 4));
			attr(text_1, "text-anchor", "end");
			attr(text_1, "class", "terrain-tag svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, rect, anchor);
			insert(target, line, anchor);
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && rect_y_value !== (rect_y_value = /*chart*/ ctx[12].terrainY)) {
				attr(rect, "y", rect_y_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_height_value !== (rect_height_value = Math.max(0, 130 - /*chart*/ ctx[12].terrainY))) {
				attr(rect, "height", rect_height_value);
			}

			if (dirty[0] & /*chart*/ 4096 && line_y__value !== (line_y__value = /*chart*/ ctx[12].terrainY)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*chart*/ 4096 && line_y__value_1 !== (line_y__value_1 = /*chart*/ ctx[12].terrainY)) {
				attr(line, "y2", line_y__value_1);
			}

			if (dirty[0] & /*chart*/ 4096 && text_1_y_value !== (text_1_y_value = Math.max(27, /*chart*/ ctx[12].terrainY - 4))) {
				attr(text_1, "y", text_1_y_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(rect);
				detach(line);
				detach(text_1);
			}
		}
	};
}

// (35:8) {#if !chart.points.trim()}
function create_if_block_19(ctx) {
	let text_1;
	let t;

	return {
		c() {
			text_1 = svg_element("text");
			t = text("Atmospheric WBZ unresolved");
			attr(text_1, "x", "195");
			attr(text_1, "y", "65");
			attr(text_1, "text-anchor", "middle");
			attr(text_1, "class", "empty-band svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		d(detaching) {
			if (detaching) {
				detach(text_1);
			}
		}
	};
}

// (43:8) {:else}
function create_else_block_3(ctx) {
	let text_1;

	let t_value = (/*chart*/ ctx[12].precipCount
	? /*chart*/ ctx[12].coverageComplete
		? 'Dry'
		: 'Dry where data available'
	: 'Precipitation unavailable') + "";

	let t;

	return {
		c() {
			text_1 = svg_element("text");
			t = text(t_value);
			attr(text_1, "x", "195");
			attr(text_1, "y", "175");
			attr(text_1, "text-anchor", "middle");
			attr(text_1, "class", "empty-band svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = (/*chart*/ ctx[12].precipCount
			? /*chart*/ ctx[12].coverageComplete
				? 'Dry'
				: 'Dry where data available'
			: 'Precipitation unavailable') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(text_1);
			}
		}
	};
}

// (39:8) {#if chart.hasPrecip}
function create_if_block_18(ctx) {
	let text0;
	let t0_value = /*chart*/ ctx[12].precipMaxLabel + "";
	let t0;
	let text1;
	let t1;
	let each_1_anchor;
	let each_value_2 = ensure_array_like(/*chart*/ ctx[12].precipBars);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			text0 = svg_element("text");
			t0 = text(t0_value);
			text1 = svg_element("text");
			t1 = text("0");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			attr(text0, "x", "37");
			attr(text0, "y", "159");
			attr(text0, "text-anchor", "end");
			attr(text0, "class", "axis precip-axis svelte-1q22nou");
			attr(text1, "x", "37");
			attr(text1, "y", "190");
			attr(text1, "text-anchor", "end");
			attr(text1, "class", "axis svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text0, anchor);
			append(text0, t0);
			insert(target, text1, anchor);
			append(text1, t1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t0_value !== (t0_value = /*chart*/ ctx[12].precipMaxLabel + "")) set_data(t0, t0_value);

			if (dirty[0] & /*chart*/ 4096) {
				each_value_2 = ensure_array_like(/*chart*/ ctx[12].precipBars);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(text0);
				detach(text1);
				detach(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (42:10) {#each chart.precipBars as bar}
function create_each_block_2(ctx) {
	let rect;
	let rect_x_value;
	let rect_y_value;
	let rect_width_value;
	let rect_height_value;

	return {
		c() {
			rect = svg_element("rect");
			attr(rect, "x", rect_x_value = /*bar*/ ctx[51].x);
			attr(rect, "y", rect_y_value = /*bar*/ ctx[51].y);
			attr(rect, "width", rect_width_value = /*bar*/ ctx[51].width);
			attr(rect, "height", rect_height_value = /*bar*/ ctx[51].height);
			attr(rect, "rx", "1.1");
			attr(rect, "class", "precip-bar svelte-1q22nou");
			toggle_class(rect, "wet", /*bar*/ ctx[51].mm >= PRECIP_THRESHOLD_MM_H);
		},
		m(target, anchor) {
			insert(target, rect, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && rect_x_value !== (rect_x_value = /*bar*/ ctx[51].x)) {
				attr(rect, "x", rect_x_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_y_value !== (rect_y_value = /*bar*/ ctx[51].y)) {
				attr(rect, "y", rect_y_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_width_value !== (rect_width_value = /*bar*/ ctx[51].width)) {
				attr(rect, "width", rect_width_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_height_value !== (rect_height_value = /*bar*/ ctx[51].height)) {
				attr(rect, "height", rect_height_value);
			}

			if (dirty[0] & /*chart*/ 4096) {
				toggle_class(rect, "wet", /*bar*/ ctx[51].mm >= PRECIP_THRESHOLD_MM_H);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(rect);
			}
		}
	};
}

// (49:8) {#each chart.phaseBlocks as block}
function create_each_block_1(ctx) {
	let rect;
	let rect_x_value;
	let rect_width_value;
	let rect_class_value;

	return {
		c() {
			rect = svg_element("rect");
			attr(rect, "x", rect_x_value = /*block*/ ctx[48].x);
			attr(rect, "y", "212");
			attr(rect, "width", rect_width_value = /*block*/ ctx[48].width);
			attr(rect, "height", "23");
			attr(rect, "rx", "2.8");
			attr(rect, "class", rect_class_value = "" + (null_to_empty(`phase-block phase-${/*block*/ ctx[48].key}`) + " svelte-1q22nou"));
		},
		m(target, anchor) {
			insert(target, rect, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && rect_x_value !== (rect_x_value = /*block*/ ctx[48].x)) {
				attr(rect, "x", rect_x_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_width_value !== (rect_width_value = /*block*/ ctx[48].width)) {
				attr(rect, "width", rect_width_value);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_class_value !== (rect_class_value = "" + (null_to_empty(`phase-block phase-${/*block*/ ctx[48].key}`) + " svelte-1q22nou"))) {
				attr(rect, "class", rect_class_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(rect);
			}
		}
	};
}

// (66:8) {:else}
function create_else_block_2(ctx) {
	let text_1;

	let t_value = (/*chart*/ ctx[12].coverageComplete
	? /*units*/ ctx[4] === 'imperial' ? '0 in' : '0 cm'
	: /*chart*/ ctx[12].snowPrefix > 0
		? '0 · available period only'
		: 'Unavailable') + "";

	let t;

	return {
		c() {
			text_1 = svg_element("text");
			t = text(t_value);
			attr(text_1, "x", "195");
			attr(text_1, "y", "305");
			attr(text_1, "text-anchor", "middle");
			attr(text_1, "class", "empty-band svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart, units*/ 4112 && t_value !== (t_value = (/*chart*/ ctx[12].coverageComplete
			? /*units*/ ctx[4] === 'imperial' ? '0 in' : '0 cm'
			: /*chart*/ ctx[12].snowPrefix > 0
				? '0 · available period only'
				: 'Unavailable') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(text_1);
			}
		}
	};
}

// (62:8) {#if chart.newSnowMax > 0.05}
function create_if_block_17(ctx) {
	let text_1;
	let t_value = /*chart*/ ctx[12].newSnowMaxLabel + "";
	let t;
	let path;
	let path_d_value;
	let polyline;
	let polyline_points_value;

	return {
		c() {
			text_1 = svg_element("text");
			t = text(t_value);
			path = svg_element("path");
			polyline = svg_element("polyline");
			attr(text_1, "x", "37");
			attr(text_1, "y", "294");
			attr(text_1, "text-anchor", "end");
			attr(text_1, "class", "axis snow-axis svelte-1q22nou");
			attr(path, "d", path_d_value = /*chart*/ ctx[12].newSnowArea);
			attr(path, "class", "new-snow-area svelte-1q22nou");
			attr(polyline, "points", polyline_points_value = /*chart*/ ctx[12].newSnowPoints);
			attr(polyline, "class", "new-snow-line svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text_1, anchor);
			append(text_1, t);
			insert(target, path, anchor);
			insert(target, polyline, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = /*chart*/ ctx[12].newSnowMaxLabel + "")) set_data(t, t_value);

			if (dirty[0] & /*chart*/ 4096 && path_d_value !== (path_d_value = /*chart*/ ctx[12].newSnowArea)) {
				attr(path, "d", path_d_value);
			}

			if (dirty[0] & /*chart*/ 4096 && polyline_points_value !== (polyline_points_value = /*chart*/ ctx[12].newSnowPoints)) {
				attr(polyline, "points", polyline_points_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(text_1);
				detach(path);
				detach(polyline);
			}
		}
	};
}

// (70:8) {#if chart.nowX !== null}
function create_if_block_16(ctx) {
	let line;
	let line_x__value;
	let line_x__value_1;
	let rect;
	let rect_x_value;
	let text_1;
	let t;
	let text_1_x_value;

	return {
		c() {
			line = svg_element("line");
			rect = svg_element("rect");
			text_1 = svg_element("text");
			t = text("Now");
			attr(line, "x1", line_x__value = /*chart*/ ctx[12].nowX);
			attr(line, "x2", line_x__value_1 = /*chart*/ ctx[12].nowX);
			attr(line, "y1", "18");
			attr(line, "y2", "316");
			attr(line, "class", "now-line svelte-1q22nou");
			attr(rect, "x", rect_x_value = Math.max(43, Math.min(322, /*chart*/ ctx[12].nowX - 13)));
			attr(rect, "y", "20");
			attr(rect, "width", "26");
			attr(rect, "height", "12");
			attr(rect, "rx", "3");
			attr(rect, "class", "now-tag-bg svelte-1q22nou");
			attr(text_1, "x", text_1_x_value = Math.max(56, Math.min(335, /*chart*/ ctx[12].nowX)));
			attr(text_1, "y", "29");
			attr(text_1, "text-anchor", "middle");
			attr(text_1, "class", "now-tag svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, rect, anchor);
			insert(target, text_1, anchor);
			append(text_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && line_x__value !== (line_x__value = /*chart*/ ctx[12].nowX)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*chart*/ 4096 && line_x__value_1 !== (line_x__value_1 = /*chart*/ ctx[12].nowX)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*chart*/ 4096 && rect_x_value !== (rect_x_value = Math.max(43, Math.min(322, /*chart*/ ctx[12].nowX - 13)))) {
				attr(rect, "x", rect_x_value);
			}

			if (dirty[0] & /*chart*/ 4096 && text_1_x_value !== (text_1_x_value = Math.max(56, Math.min(335, /*chart*/ ctx[12].nowX)))) {
				attr(text_1, "x", text_1_x_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(rect);
				detach(text_1);
			}
		}
	};
}

// (75:8) {#if chart.currentX !== null && chart.currentY !== null}
function create_if_block_15(ctx) {
	let line;
	let line_x__value;
	let line_x__value_1;
	let circle;
	let circle_cx_value;
	let circle_cy_value;

	return {
		c() {
			line = svg_element("line");
			circle = svg_element("circle");
			attr(line, "x1", line_x__value = /*chart*/ ctx[12].currentX);
			attr(line, "x2", line_x__value_1 = /*chart*/ ctx[12].currentX);
			attr(line, "y1", "18");
			attr(line, "y2", "316");
			attr(line, "class", "cursor svelte-1q22nou");
			attr(circle, "cx", circle_cx_value = /*chart*/ ctx[12].currentX);
			attr(circle, "cy", circle_cy_value = /*chart*/ ctx[12].currentY);
			attr(circle, "r", "4.2");
			attr(circle, "class", "current-dot svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, line, anchor);
			insert(target, circle, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && line_x__value !== (line_x__value = /*chart*/ ctx[12].currentX)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*chart*/ 4096 && line_x__value_1 !== (line_x__value_1 = /*chart*/ ctx[12].currentX)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*chart*/ 4096 && circle_cx_value !== (circle_cx_value = /*chart*/ ctx[12].currentX)) {
				attr(circle, "cx", circle_cx_value);
			}

			if (dirty[0] & /*chart*/ 4096 && circle_cy_value !== (circle_cy_value = /*chart*/ ctx[12].currentY)) {
				attr(circle, "cy", circle_cy_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
				detach(circle);
			}
		}
	};
}

// (79:8) {#if tooltip}
function create_if_block_14(ctx) {
	let line;
	let line_x__value;
	let line_x__value_1;

	return {
		c() {
			line = svg_element("line");
			attr(line, "x1", line_x__value = /*tooltip*/ ctx[11].x);
			attr(line, "x2", line_x__value_1 = /*tooltip*/ ctx[11].x);
			attr(line, "y1", "18");
			attr(line, "y2", "316");
			attr(line, "class", "inspect-line svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, line, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tooltip*/ 2048 && line_x__value !== (line_x__value = /*tooltip*/ ctx[11].x)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*tooltip*/ 2048 && line_x__value_1 !== (line_x__value_1 = /*tooltip*/ ctx[11].x)) {
				attr(line, "x2", line_x__value_1);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
			}
		}
	};
}

// (81:8) {#each [24,48,72,96,120,144] as hour}
function create_each_block(ctx) {
	let text_1;
	let t0;
	let t1;
	let t2;

	return {
		c() {
			text_1 = svg_element("text");
			t0 = text("+");
			t1 = text(/*hour*/ ctx[45]);
			t2 = text(" h");
			attr(text_1, "x", 42 + 306 * /*hour*/ ctx[45] / 144);
			attr(text_1, "y", "334");
			attr(text_1, "text-anchor", /*hour*/ ctx[45] === 144 ? 'end' : 'middle');
			attr(text_1, "class", "axis timeline-tick svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, text_1, anchor);
			append(text_1, t0);
			append(text_1, t1);
			append(text_1, t2);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(text_1);
			}
		}
	};
}

// (86:6) {#if tooltip}
function create_if_block_11$1(ctx) {
	let div1;
	let b0;
	let t0_value = /*tooltip*/ ctx[11].timeLabel + "";
	let t0;
	let t1;
	let t2;
	let div0;
	let span0;
	let t3;
	let b1;

	let t4_value = (/*tooltip*/ ctx[11].snowline === null
	? 'Unresolved'
	: formatElevation(/*tooltip*/ ctx[11].snowline, /*units*/ ctx[4])) + "";

	let t4;
	let t5;
	let span1;
	let t6;
	let b2;
	let t7_value = formatPrecip(/*tooltip*/ ctx[11].precip, /*units*/ ctx[4]) + "";
	let t7;
	let t8;
	let span2;
	let t9;
	let b3;
	let t10_value = formatSnow(/*tooltip*/ ctx[11].newSnow, /*units*/ ctx[4]) + "";
	let t10;
	let t11;
	let div1_style_value;
	let if_block0 = /*tooltip*/ ctx[11].phase && create_if_block_13(ctx);
	let if_block1 = /*terrainM*/ ctx[2] !== null && create_if_block_12(ctx);

	return {
		c() {
			div1 = element("div");
			b0 = element("b");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			div0 = element("div");
			span0 = element("span");
			t3 = text("SL ");
			b1 = element("b");
			t4 = text(t4_value);
			t5 = space();
			span1 = element("span");
			t6 = text("Precip ");
			b2 = element("b");
			t7 = text(t7_value);
			t8 = space();
			span2 = element("span");
			t9 = text("New snow ");
			b3 = element("b");
			t10 = text(t10_value);
			t11 = space();
			if (if_block1) if_block1.c();
			attr(b0, "class", "svelte-1q22nou");
			attr(b1, "class", "svelte-1q22nou");
			attr(span0, "class", "svelte-1q22nou");
			attr(b2, "class", "svelte-1q22nou");
			attr(span1, "class", "svelte-1q22nou");
			attr(b3, "class", "svelte-1q22nou");
			attr(span2, "class", "svelte-1q22nou");
			attr(div0, "class", "tip-grid svelte-1q22nou");
			attr(div1, "class", "tooltip svelte-1q22nou");
			attr(div1, "style", div1_style_value = `left:${/*tooltip*/ ctx[11].cssX}px;top:${/*tooltip*/ ctx[11].cssY}px;`);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, b0);
			append(b0, t0);
			append(div1, t1);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t2);
			append(div1, div0);
			append(div0, span0);
			append(span0, t3);
			append(span0, b1);
			append(b1, t4);
			append(div0, t5);
			append(div0, span1);
			append(span1, t6);
			append(span1, b2);
			append(b2, t7);
			append(div0, t8);
			append(div0, span2);
			append(span2, t9);
			append(span2, b3);
			append(b3, t10);
			append(div0, t11);
			if (if_block1) if_block1.m(div0, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tooltip*/ 2048 && t0_value !== (t0_value = /*tooltip*/ ctx[11].timeLabel + "")) set_data(t0, t0_value);

			if (/*tooltip*/ ctx[11].phase) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_13(ctx);
					if_block0.c();
					if_block0.m(div1, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*tooltip, units*/ 2064 && t4_value !== (t4_value = (/*tooltip*/ ctx[11].snowline === null
			? 'Unresolved'
			: formatElevation(/*tooltip*/ ctx[11].snowline, /*units*/ ctx[4])) + "")) set_data(t4, t4_value);

			if (dirty[0] & /*tooltip, units*/ 2064 && t7_value !== (t7_value = formatPrecip(/*tooltip*/ ctx[11].precip, /*units*/ ctx[4]) + "")) set_data(t7, t7_value);
			if (dirty[0] & /*tooltip, units*/ 2064 && t10_value !== (t10_value = formatSnow(/*tooltip*/ ctx[11].newSnow, /*units*/ ctx[4]) + "")) set_data(t10, t10_value);

			if (/*terrainM*/ ctx[2] !== null) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_12(ctx);
					if_block1.c();
					if_block1.m(div0, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*tooltip*/ 2048 && div1_style_value !== (div1_style_value = `left:${/*tooltip*/ ctx[11].cssX}px;top:${/*tooltip*/ ctx[11].cssY}px;`)) {
				attr(div1, "style", div1_style_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (89:10) {#if tooltip.phase}
function create_if_block_13(ctx) {
	let strong;
	let i;
	let i_class_value;
	let t_value = precipitationLabel(/*tooltip*/ ctx[11].phase) + "";
	let t;
	let strong_class_value;

	return {
		c() {
			strong = element("strong");
			i = element("i");
			t = text(t_value);
			attr(i, "class", i_class_value = "" + (null_to_empty(`tip-phase-dot phase-${/*tooltip*/ ctx[11].phase.key}`) + " svelte-1q22nou"));
			attr(strong, "class", strong_class_value = "" + (null_to_empty(`text-${/*tooltip*/ ctx[11].phase.key}`) + " svelte-1q22nou"));
		},
		m(target, anchor) {
			insert(target, strong, anchor);
			append(strong, i);
			append(strong, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*tooltip*/ 2048 && i_class_value !== (i_class_value = "" + (null_to_empty(`tip-phase-dot phase-${/*tooltip*/ ctx[11].phase.key}`) + " svelte-1q22nou"))) {
				attr(i, "class", i_class_value);
			}

			if (dirty[0] & /*tooltip*/ 2048 && t_value !== (t_value = precipitationLabel(/*tooltip*/ ctx[11].phase) + "")) set_data(t, t_value);

			if (dirty[0] & /*tooltip*/ 2048 && strong_class_value !== (strong_class_value = "" + (null_to_empty(`text-${/*tooltip*/ ctx[11].phase.key}`) + " svelte-1q22nou"))) {
				attr(strong, "class", strong_class_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(strong);
			}
		}
	};
}

// (94:12) {#if terrainM !== null}
function create_if_block_12(ctx) {
	let span;
	let t0;
	let b;
	let t1_value = formatElevation(/*terrainM*/ ctx[2], /*units*/ ctx[4]) + "";
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text("Terrain ");
			b = element("b");
			t1 = text(t1_value);
			attr(b, "class", "svelte-1q22nou");
			attr(span, "class", "svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, b);
			append(b, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*terrainM, units*/ 20 && t1_value !== (t1_value = formatElevation(/*terrainM*/ ctx[2], /*units*/ ctx[4]) + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (102:142) {:else}
function create_else_block_1(ctx) {
	let t_value = /*chart*/ ctx[12].currentCondition + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = /*chart*/ ctx[12].currentCondition + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t);
			}
		}
	};
}

// (102:11) {#if chart.currentPhase}
function create_if_block_10$1(ctx) {
	let i;
	let i_class_value;
	let t_value = precipitationLabel(/*chart*/ ctx[12].currentPhase) + "";
	let t;

	return {
		c() {
			i = element("i");
			t = text(t_value);
			attr(i, "class", i_class_value = "" + (null_to_empty(`current-phase-dot phase-${/*chart*/ ctx[12].currentPhase.key}`) + " svelte-1q22nou"));
		},
		m(target, anchor) {
			insert(target, i, anchor);
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && i_class_value !== (i_class_value = "" + (null_to_empty(`current-phase-dot phase-${/*chart*/ ctx[12].currentPhase.key}`) + " svelte-1q22nou"))) {
				attr(i, "class", i_class_value);
			}

			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = precipitationLabel(/*chart*/ ctx[12].currentPhase) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(i);
				detach(t);
			}
		}
	};
}

// (103:8) {#if chart.currentPosition}
function create_if_block_9$1(ctx) {
	let strong;
	let t_value = /*chart*/ ctx[12].currentPosition + "";
	let t;

	return {
		c() {
			strong = element("strong");
			t = text(t_value);
			attr(strong, "class", "svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, strong, anchor);
			append(strong, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = /*chart*/ ctx[12].currentPosition + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(strong);
			}
		}
	};
}

// (116:6) {:else}
function create_else_block$1(ctx) {
	let span;
	let t_value = noEventMessage(/*point*/ ctx[1], /*terrainM*/ ctx[2], /*timestamp*/ ctx[5]) + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*point, terrainM, timestamp*/ 38 && t_value !== (t_value = noEventMessage(/*point*/ ctx[1], /*terrainM*/ ctx[2], /*timestamp*/ ctx[5]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (113:6) {#if event}
function create_if_block_5$1(ctx) {
	let span;
	let t0_value = /*event*/ ctx[13].dominantPhase.icon + "";
	let t0;
	let t1;
	let t2_value = precipitationLabel(/*event*/ ctx[13].dominantPhase, /*event*/ ctx[13].confidence) + "";
	let t2;
	let t3;
	let t4_value = formatEventRange(/*event*/ ctx[13].startTime, /*event*/ ctx[13].endTime) + "";
	let t4;
	let t5;
	let if_block1_anchor;

	function select_block_type_6(ctx, dirty) {
		if (/*event*/ ctx[13].incomplete) return create_if_block_7$1;
		if (/*event*/ ctx[13].newSnowCm > 0.05) return create_if_block_8$1;
	}

	let current_block_type = select_block_type_6(ctx);
	let if_block0 = current_block_type && current_block_type(ctx);
	let if_block1 = !/*event*/ ctx[13].activeNow && create_if_block_6$1(ctx);

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(t2_value);
			t3 = text(" · ");
			t4 = text(t4_value);
			if (if_block0) if_block0.c();
			t5 = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
			attr(span, "class", "svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
			append(span, t2);
			append(span, t3);
			append(span, t4);
			if (if_block0) if_block0.m(span, null);
			insert(target, t5, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*event*/ 8192 && t0_value !== (t0_value = /*event*/ ctx[13].dominantPhase.icon + "")) set_data(t0, t0_value);
			if (dirty[0] & /*event*/ 8192 && t2_value !== (t2_value = precipitationLabel(/*event*/ ctx[13].dominantPhase, /*event*/ ctx[13].confidence) + "")) set_data(t2, t2_value);
			if (dirty[0] & /*event*/ 8192 && t4_value !== (t4_value = formatEventRange(/*event*/ ctx[13].startTime, /*event*/ ctx[13].endTime) + "")) set_data(t4, t4_value);

			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if (if_block0) if_block0.d(1);
				if_block0 = current_block_type && current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(span, null);
				}
			}

			if (!/*event*/ ctx[13].activeNow) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_6$1(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(span);
				detach(t5);
				detach(if_block1_anchor);
			}

			if (if_block0) {
				if_block0.d();
			}

			if (if_block1) if_block1.d(detaching);
		}
	};
}

// (114:226) 
function create_if_block_8$1(ctx) {
	let t0;
	let t1_value = formatSnow(/*event*/ ctx[13].newSnowCm, /*units*/ ctx[4]) + "";
	let t1;
	let t2_value = (/*event*/ ctx[13].activeNow ? ' remaining' : '') + "";
	let t2;

	return {
		c() {
			t0 = text("· est. ");
			t1 = text(t1_value);
			t2 = text(t2_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*event, units*/ 8208 && t1_value !== (t1_value = formatSnow(/*event*/ ctx[13].newSnowCm, /*units*/ ctx[4]) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*event*/ 8192 && t2_value !== (t2_value = (/*event*/ ctx[13].activeNow ? ' remaining' : '') + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
				detach(t2);
			}
		}
	};
}

// (114:152) {#if event.incomplete}
function create_if_block_7$1(ctx) {
	let t;

	return {
		c() {
			t = text("· Amount uncertain");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(t);
			}
		}
	};
}

// (115:8) {#if !event.activeNow}
function create_if_block_6$1(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Go to event →";
			attr(button, "type", "button");
			attr(button, "title", "Jump to event start");
			attr(button, "class", "svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*jumpToEvent*/ ctx[18]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (120:4) {#if crossing?.crossingTime !== null && crossing?.crossingTime !== undefined && crossing.crossingTime > timestamp}
function create_if_block_4$1(ctx) {
	let button;

	let t0_value = (/*crossing*/ ctx[6].direction === 'below'
	? 'Snowline falls below this elevation'
	: 'Snowline rises above this elevation') + "";

	let t0;
	let t1;
	let t2_value = formatShortTime(/*crossing*/ ctx[6].crossingTime) + "";
	let t2;
	let t3;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = text(" · ");
			t2 = text(t2_value);
			t3 = text(" →");
			attr(button, "class", "crossing-action svelte-1q22nou");
			attr(button, "type", "button");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			append(button, t1);
			append(button, t2);
			append(button, t3);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler_3*/ ctx[28]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*crossing*/ 64 && t0_value !== (t0_value = (/*crossing*/ ctx[6].direction === 'below'
			? 'Snowline falls below this elevation'
			: 'Snowline rises above this elevation') + "")) set_data(t0, t0_value);

			if (dirty[0] & /*crossing*/ 64 && t2_value !== (t2_value = formatShortTime(/*crossing*/ ctx[6].crossingTime) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (121:4) {#if chart.currentPhase?.confidence === 'low'}
function create_if_block_3$1(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Limited atmospheric detail at this elevation; type may differ.";
			attr(div, "class", "quality-note svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (122:4) {#if event && chart.coverageNote}
function create_if_block_2$1(ctx) {
	let div;
	let t_value = /*chart*/ ctx[12].coverageNote + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "quality-note svelte-1q22nou");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*chart*/ 4096 && t_value !== (t_value = /*chart*/ ctx[12].coverageNote + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment$2(ctx) {
	let div4;
	let div2;
	let div0;
	let b;
	let t1;
	let small;
	let t2_value = (/*placeName*/ ctx[3] || 'Selected point') + "";
	let t2;
	let t3;
	let em;
	let t4_value = (/*chart*/ ctx[12]?.validLabel ?? 'ECMWF profile · Windy terrain') + "";
	let t4;
	let t5;
	let div1;
	let t6;
	let t7;
	let button0;
	let t9;
	let button1;
	let t11;
	let div3;
	let button2;
	let t12;
	let button2_aria_selected_value;
	let button3;
	let t13;
	let button3_aria_selected_value;
	let t14;
	let current_block_type_index;
	let if_block2;
	let div4_style_value;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*tab*/ ctx[0] === 'graph' && /*showNow*/ ctx[14] && create_if_block_22(ctx);
	let if_block1 = /*tab*/ ctx[0] === 'graph' && /*chart*/ ctx[12] && create_if_block_21(ctx);
	const if_block_creators = [create_if_block$1, create_else_block_5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*tab*/ ctx[0] === 'graph') return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div4 = element("div");
			div2 = element("div");
			div0 = element("div");
			b = element("b");
			b.textContent = "Wintry forecast";
			t1 = space();
			small = element("small");
			t2 = text(t2_value);
			t3 = space();
			em = element("em");
			t4 = text(t4_value);
			t5 = space();
			div1 = element("div");
			if (if_block0) if_block0.c();
			t6 = space();
			if (if_block1) if_block1.c();
			t7 = space();
			button0 = element("button");
			button0.textContent = "↕";
			t9 = space();
			button1 = element("button");
			button1.textContent = "×";
			t11 = space();
			div3 = element("div");
			button2 = element("button");
			t12 = text("Forecast");
			button3 = element("button");
			t13 = text("Sounding");
			t14 = space();
			if_block2.c();
			attr(b, "class", "svelte-1q22nou");
			attr(small, "class", "svelte-1q22nou");
			attr(em, "class", "svelte-1q22nou");
			attr(div0, "class", "chart-title svelte-1q22nou");
			attr(button0, "class", "drag-button svelte-1q22nou");
			attr(button0, "type", "button");
			attr(button0, "title", "Drag graph");
			attr(button0, "aria-label", "Drag graph");
			attr(button1, "type", "button");
			attr(button1, "title", "Close");
			attr(button1, "aria-label", "Close graph");
			attr(button1, "class", "svelte-1q22nou");
			attr(div1, "class", "chart-actions svelte-1q22nou");
			attr(div2, "class", "chart-head svelte-1q22nou");
			attr(button2, "type", "button");
			attr(button2, "role", "tab");
			attr(button2, "aria-selected", button2_aria_selected_value = /*tab*/ ctx[0] === 'graph');
			attr(button2, "class", "svelte-1q22nou");
			toggle_class(button2, "active", /*tab*/ ctx[0] === 'graph');
			attr(button3, "type", "button");
			attr(button3, "role", "tab");
			attr(button3, "aria-selected", button3_aria_selected_value = /*tab*/ ctx[0] === 'sounding');
			attr(button3, "class", "svelte-1q22nou");
			toggle_class(button3, "active", /*tab*/ ctx[0] === 'sounding');
			attr(div3, "class", "forecast-tabs svelte-1q22nou");
			attr(div3, "role", "tablist");
			attr(div3, "aria-label", "Forecast view");
			attr(div4, "class", "chart-shell svelte-1q22nou");
			attr(div4, "role", "dialog");
			attr(div4, "aria-modal", "false");
			attr(div4, "aria-label", "Wintry forecast graph");
			attr(div4, "style", div4_style_value = `left:${/*position*/ ctx[10].x}px;top:${/*position*/ ctx[10].y}px;transform:none;`);
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div2);
			append(div2, div0);
			append(div0, b);
			append(div0, t1);
			append(div0, small);
			append(small, t2);
			append(div0, t3);
			append(div0, em);
			append(em, t4);
			append(div2, t5);
			append(div2, div1);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t6);
			if (if_block1) if_block1.m(div1, null);
			append(div1, t7);
			append(div1, button0);
			append(div1, t9);
			append(div1, button1);
			append(div4, t11);
			append(div4, div3);
			append(div3, button2);
			append(button2, t12);
			append(div3, button3);
			append(button3, t13);
			append(div4, t14);
			if_blocks[current_block_type_index].m(div4, null);
			/*div4_binding*/ ctx[29](div4);
			current = true;

			if (!mounted) {
				dispose = [
					listen(button0, "pointerdown", /*startDrag*/ ctx[16]),
					listen(button1, "click", /*click_handler*/ ctx[23]),
					listen(button2, "click", /*click_handler_1*/ ctx[24]),
					listen(button3, "click", /*click_handler_2*/ ctx[25])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if ((!current || dirty[0] & /*placeName*/ 8) && t2_value !== (t2_value = (/*placeName*/ ctx[3] || 'Selected point') + "")) set_data(t2, t2_value);
			if ((!current || dirty[0] & /*chart*/ 4096) && t4_value !== (t4_value = (/*chart*/ ctx[12]?.validLabel ?? 'ECMWF profile · Windy terrain') + "")) set_data(t4, t4_value);

			if (/*tab*/ ctx[0] === 'graph' && /*showNow*/ ctx[14]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_22(ctx);
					if_block0.c();
					if_block0.m(div1, t6);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*tab*/ ctx[0] === 'graph' && /*chart*/ ctx[12]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_21(ctx);
					if_block1.c();
					if_block1.m(div1, t7);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (!current || dirty[0] & /*tab*/ 1 && button2_aria_selected_value !== (button2_aria_selected_value = /*tab*/ ctx[0] === 'graph')) {
				attr(button2, "aria-selected", button2_aria_selected_value);
			}

			if (!current || dirty[0] & /*tab*/ 1) {
				toggle_class(button2, "active", /*tab*/ ctx[0] === 'graph');
			}

			if (!current || dirty[0] & /*tab*/ 1 && button3_aria_selected_value !== (button3_aria_selected_value = /*tab*/ ctx[0] === 'sounding')) {
				attr(button3, "aria-selected", button3_aria_selected_value);
			}

			if (!current || dirty[0] & /*tab*/ 1) {
				toggle_class(button3, "active", /*tab*/ ctx[0] === 'sounding');
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block2 = if_blocks[current_block_type_index];

				if (!if_block2) {
					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block2.c();
				} else {
					if_block2.p(ctx, dirty);
				}

				transition_in(if_block2, 1);
				if_block2.m(div4, null);
			}

			if (!current || dirty[0] & /*position*/ 1024 && div4_style_value !== (div4_style_value = `left:${/*position*/ ctx[10].x}px;top:${/*position*/ ctx[10].y}px;transform:none;`)) {
				attr(div4, "style", div4_style_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block2);
			current = true;
		},
		o(local) {
			transition_out(if_block2);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(div4);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_blocks[current_block_type_index].d();
			/*div4_binding*/ ctx[29](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function formatTooltipTime(time) {
	return new Date(time).toLocaleString(undefined, {
		weekday: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatShortTime(time) {
	return new Date(time).toLocaleString(undefined, {
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatRun(time) {
	if (time === null || !Number.isFinite(time)) return 'ECMWF · run unavailable';
	return `ECMWF ${String(new Date(Number(time)).getUTCHours()).padStart(2, '0')}Z`;
}

function phaseName(key) {
	if (!key) return 'Dry';

	const labels = {
		snow: 'Snow',
		'wet-snow': 'Wet snow',
		mix: 'Mix',
		rain: 'Rain',
		'ice-pellets': 'Ice pellets',
		'freezing-rain': 'Freezing rain'
	};

	return labels[key];
}

function formatEventRange(start, end) {
	const a = formatShortTime(start),
		b = new Date(start).toDateString() === new Date(end).toDateString()
		? new Date(end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
		: formatShortTime(end);

	return start === end ? a : `${a}–${b}`;
}

function instance$2($$self, $$props, $$invalidate) {
	let crossing;
	let event;
	let chart;
	let showNow;
	let { point } = $$props;
	let { terrainM = null } = $$props;
	let { placeName = '' } = $$props;
	let { tab = 'graph' } = $$props;
	let { units = 'metric' } = $$props;
	const dispatch = createEventDispatcher();
	let timestamp = Date.now();
	let realNow = Date.now();
	let timestampListener = null;
	let realNowTimer = null;
	let pngBusy = false;
	let chartShell = null;
	let svgEl = null;
	let position = { x: 24, y: 60 };
	let dragPointerId = null;
	let dragOffset = { x: 0, y: 0 };
	let tooltip = null;

	function snowlineAt(p, index) {
		try {
			const v = wetBulbZeroHeight(buildProfile(p.forecast, index)).snowLevelM;
			return v !== null && Number.isFinite(v) ? v : null;
		} catch {
			return null;
		}
	}

	function phaseAt(p, terrain, index) {
		if (terrain === null || !Number.isFinite(terrain)) return null;
		const precip = precipMmAt(p.forecast, index);
		if (precip === null || precip < PRECIP_THRESHOLD_MM_H) return null;
		return terrainPrecipitationType(buildProfile(p.forecast, index), terrain);
	}

	function terrainPosition(difference) {
		if (difference === null) return '';
		const value = formatElevation(Math.abs(difference), units);
		if (difference > 100) return `${value} above snowline`;
		if (difference < -100) return `${value} below snowline`;
		return 'Terrain near snowline';
	}

	function clampPosition(x, y) {
		const rect = chartShell?.getBoundingClientRect();
		const w = rect?.width ?? 430, h = rect?.height ?? 590;

		return {
			x: Math.max(6, Math.min(window.innerWidth - w - 6, x)),
			y: Math.max(6, Math.min(window.innerHeight - h - 6, y))
		};
	}

	function startDrag(event) {
		if (!chartShell) return;
		dragPointerId = event.pointerId;
		const rect = chartShell.getBoundingClientRect();

		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};

		window.addEventListener('pointermove', dragMove);
		window.addEventListener('pointerup', stopDrag, { once: true });
		event.preventDefault();
	}

	function dragMove(event) {
		if (event.pointerId === dragPointerId) $$invalidate(10, position = clampPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y));
	}

	function stopDrag(event) {
		if (event.pointerId === dragPointerId) dragPointerId = null;
		window.removeEventListener('pointermove', dragMove);
	}

	function setTimeline(time) {
		if (!Number.isFinite(time)) return;

		try {
			store.set('timestamp', time);
			$$invalidate(5, timestamp = time);
			$$invalidate(11, tooltip = null);
		} catch {
			
		}
	}

	function jumpToCrossing(time) {
		setTimeline(time);
	}

	function jumpToEvent() {
		if (event?.startTime) setTimeline(event.startTime);
	}

	function resetToNow() {
		if (!point?.times?.length) return;
		$$invalidate(22, realNow = Date.now());
		setTimeline(realNow);
	}

	function buildBlocks(p, phases, x) {
		const blocks = [];

		for (let i = 0; i < phases.length; i++) {
			const phase = phases[i];
			if (!phase) continue;

			const left = Math.max(42, x(p.times[i])),
				right = Math.min(348, x(intervalEnd(p.times, i)));

			if (right <= left) continue;
			const previous = blocks.at(-1);

			if (previous?.key === phase.key && Math.abs(previous.x + previous.width - left) < 0.01) previous.width = right - previous.x; else blocks.push({
				x: left,
				width: right - left,
				key: phase.key
			});
		}

		return blocks;
	}

	function phaseSummary(phases, precip, newSnow) {
		const amounts = {
			snow: 0,
			'wet-snow': 0,
			mix: 0,
			rain: 0,
			'ice-pellets': 0,
			'freezing-rain': 0
		};

		let total = 0;

		phases.forEach((phase, i) => {
			const mm = precip[i];
			if (!phase || mm === null || mm < PRECIP_THRESHOLD_MM_H) return;
			amounts[phase.key] += mm;
			total += mm;
		});

		const finalSnow = newSnow.length ? newSnow[newSnow.length - 1] : 0;
		if (total < PRECIP_THRESHOLD_MM_H) return 'Dry forecast · no meaningful precipitation.';
		const ranked = Object.entries(amounts).sort((a, b) => b[1] - a[1]);
		const [key, amount] = ranked[0], pct = Math.round(amount / total * 100);
		return `${phaseName(key)} ${pct}% · new snow est. ${formatSnow(finalSnow, units)}`;
	}

	function buildChart(p, terrain, target, crossingTime, now, units) {
		if (!p?.times?.length) return null;
		const samples = p.times.map((time, i) => ({ time, value: snowlineAt(p, i) }));
		const entries = samples.filter(v => v.value !== null && Number.isFinite(v.value));

		const snow = entries.map(v => Number(v.value)),
			scaleValues = terrain !== null && Number.isFinite(terrain)
			? [...snow, terrain]
			: snow.length ? snow : [0];

		let min = Math.floor((Math.min(...scaleValues) - 150) / 100) * 100,
			max = Math.ceil((Math.max(...scaleValues) + 150) / 100) * 100;

		if (max - min < 600) {
			const mid = (min + max) / 2;
			min = Math.floor((mid - 300) / 100) * 100;
			max = Math.ceil((mid + 300) / 100) * 100;
		}

		const left = 42,
			right = 348,
			top = 18,
			bottom = 130,
			t0 = p.times[0],
			t1 = t0 + 144 * 3600_000;

		const x = t => left + (t - t0) / Math.max(1, t1 - t0) * (right - left),
			y = v => bottom - (v - min) / Math.max(1, max - min) * (bottom - top);

		let connected = false;

		const points = samples.map((v, i) => {
			if (i > 0 && v.time - samples[i - 1].time > 3 * 3600_000) connected = false;

			if (v.value === null) {
				connected = false;
				return '';
			}

			const command = connected ? 'L' : 'M';
			connected = true;
			return `${command}${x(v.time).toFixed(1)},${y(v.value).toFixed(1)}`;
		}).join(' ');

		const currentIndex = forecastIntervalIndex(p.times, target);
		if (currentIndex < 0) return null;

		const currentValue = snowlineAt(p, currentIndex),
			currentTime = p.times[currentIndex];

		const currentTerrainDifference = currentValue !== null && terrain !== null
		? Math.round((terrain - currentValue) / 10) * 10
		: null;

		const precipValues = p.times.map((_, i) => precipMmAt(p.forecast, i)),
			validPrecip = precipValues.filter(v => v !== null && Number.isFinite(v)),
			precipMax = validPrecip.length
			? Math.max(PRECIP_THRESHOLD_MM_H, ...validPrecip)
			: 0;

		const spacing = p.times.length > 1
			? x(p.times[1]) - x(p.times[0])
			: 306 * 3 / 144,
			barWidth = Math.max(1.1, Math.min(4.5, spacing * .78));

		const precipBars = precipValues.map((mm, i) => {
			const value = mm ?? 0,
				height = precipMax > 0 ? Math.min(30, value / precipMax * 30) : 0;

			return {
				x: Math.min(348 - barWidth, x(p.times[i])),
				y: 188 - height,
				width: barWidth,
				height,
				mm: value
			};
		}).filter((b, i) => b.height > .1 && p.times[i] < t1);

		const phases = p.times.map((_, i) => phaseAt(p, terrain, i));
		const coverage = forecastCoverage(precipValues, phases, p.times);
		const cumulativeNewSnow = [];
		let running = 0;

		for (let i = 0; i < p.times.length; i++) {
			const dt = Math.max(0, (intervalEnd(p.times, i) - p.times[i]) / 3600_000);
			running = estimateNewSnowStep(precipValues[i], phases[i], running, dt).cumulativeCm;
			cumulativeNewSnow.push(running);
		}

		const newSnowMax = Math.max(0, ...cumulativeNewSnow.slice(0, coverage.prefix)),
			snowTop = 288,
			snowBottom = 316;

		const snowY = v => snowBottom - (newSnowMax > 0
		? v / newSnowMax * (snowBottom - snowTop)
		: 0);

		const newSnowPoints = coverage.prefix
		? [
				`${x(t0).toFixed(1)},${snowBottom}`,
				...cumulativeNewSnow.slice(0, coverage.prefix).map((v, i) => `${x(intervalEnd(p.times, i)).toFixed(1)},${snowY(v).toFixed(1)}`)
			].join(' ')
		: '';

		const newSnowArea = coverage.prefix > 0
		? `M ${x(p.times[0]).toFixed(1)} ${snowBottom} L ${newSnowPoints.replace(/,/g, ' ')} L ${x(intervalEnd(p.times, coverage.prefix - 1)).toFixed(1)} ${snowBottom} Z`
		: '';

		const end24 = target + 24 * 3600_000;
		const windowIndices = p.times.map((time, i) => ({ time, i })).filter(v => v.time + forecastIntervalHours(p.times, v.i) * 3600_000 > target && v.time < end24).map(v => v.i);
		const minEntry = windowIndices.map(i => ({ i, value: snowlineAt(p, i) })).filter(v => v.value !== null && Number.isFinite(v.value)).sort((a, b) => a.value - b.value)[0] ?? null;

		const min24Snowline = minEntry
		? Math.round(Number(minEntry.value) / 10) * 10
		: null;

		let newSnow24h = 0;

		for (const i of windowIndices) {
			if (p.times[i] >= end24) continue;
			const dt = (Math.min(end24, p.times[i] + forecastIntervalHours(p.times, i) * 3600_000) - Math.max(target, p.times[i])) / 3600_000;
			newSnow24h = estimateNewSnowStep(precipValues[i], phases[i], newSnow24h, dt).cumulativeCm;
		}

		const currentKey = phases[currentIndex]?.key ?? null;
		let nextChangeLabel = '';
		let nextChangeTime = null;

		for (let i = currentIndex + 1; coverage.known[currentIndex] && i < p.times.length && p.times[i] <= end24; i++) {
			const candidate = phases[i]?.key ?? null;
			if (!coverage.known[i] || i > 0 && p.times[i] - p.times[i - 1] > 3 * 3600_000) break;
			if (candidate === currentKey) continue;
			const check = [i, i + 1, i + 2].filter(j => j < p.times.length && p.times[j] <= end24);
			if (!check.length || !check.every(j => coverage.known[j] && (phases[j]?.key ?? null) === candidate)) continue;
			nextChangeLabel = `${phaseName(currentKey)} → ${phaseName(candidate)} · ${formatShortTime(p.times[i])}`;
			nextChangeTime = p.times[i];
			break;
		}

		return {
			points,
			terrainY: terrain !== null
			? Math.max(top, Math.min(bottom, y(terrain)))
			: null,
			currentX: x(currentTime),
			currentY: currentValue !== null ? y(currentValue) : null,
			nowX: now >= t0 && now <= t1 ? x(now) : null,
			crossingX: crossingTime !== null ? x(crossingTime) : null,
			min24X: minEntry ? x(p.times[minEntry.i]) : null,
			min24Y: minEntry ? y(Number(minEntry.value)) : null,
			minLabel: formatElevation(min, units),
			midLabel: formatElevation((min + max) / 2, units),
			maxLabel: formatElevation(max, units),
			startLabel: new Date(t0).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
			currentSnowline: currentValue !== null
			? Math.round(currentValue / 10) * 10
			: null,
			currentTerrainDifference,
			currentPosition: terrainPosition(currentTerrainDifference),
			currentPrecip: precipValues[currentIndex] ?? null,
			currentPhase: phases[currentIndex],
			currentCondition: conditionLabel(precipValues[currentIndex], phases[currentIndex]),
			coverageComplete: coverage.complete,
			precipCount: coverage.precipCount,
			snowPrefix: coverage.prefix,
			coverageNote: coverage.note,
			midTimeLabel: '+' + Math.round((t1 - t0) / 7200000) + ' h',
			endTimeLabel: '+' + Math.round((t1 - t0) / 3600000) + ' h',
			currentNewSnow: cumulativeNewSnow[currentIndex] ?? 0,
			precipBars,
			hasPrecip: validPrecip.some(v => v >= PRECIP_THRESHOLD_MM_H),
			precipMaxLabel: precipMax
			? formatPrecip(precipMax, units).replace(/\s*(mm|in)\/3h$/, '')
			: '—',
			minScale: min,
			maxScale: max,
			validLabel: `Forecast ${formatTooltipTime(target)} · ${formatRun(p.runTime)}`,
			phaseBlocks: buildBlocks(p, phases, x),
			phaseSummary: phaseSummary(phases, precipValues, cumulativeNewSnow),
			newSnowPoints,
			newSnowArea,
			newSnowMax,
			newSnowMaxLabel: formatSnow(newSnowMax, units),
			cumulativeNewSnow,
			min24Snowline,
			window24Complete: coversWindow(p.times, coverage.known, target, end24),
			newSnow24h: Math.max(0, newSnow24h),
			nextChangeLabel,
			nextChangeTime
		};
	}

	function handlePointer(event) {
		if (!svgEl || !chart || !point?.times?.length) return;

		const rect = svgEl.getBoundingClientRect(),
			vx = (event.clientX - rect.left) / rect.width * 360;

		if (vx < 42 || vx > 348) {
			$$invalidate(11, tooltip = null);
			return;
		}

		const t0 = point.times[0],
			t1 = t0 + 144 * 3600_000,
			hoverTime = t0 + (vx - 42) / 306 * (t1 - t0);

		const idx = forecastIntervalIndex(point.times, hoverTime);

		if (idx < 0) {
			$$invalidate(11, tooltip = null);
			return;
		}

		const time = point.times[idx], x = 42 + (time - t0) / (t1 - t0) * 306;
		if (event.type === 'pointerdown') setTimeline(time);

		$$invalidate(11, tooltip = {
			x,
			cssX: Math.max(92, Math.min(rect.width - 92, x / 360 * rect.width)),
			cssY: 44,
			snowline: (() => {
				const v = snowlineAt(point, idx);
				return v === null ? null : Math.round(v / 10) * 10;
			})(),
			precip: precipMmAt(point.forecast, idx),
			phase: phaseAt(point, terrainM, idx),
			newSnow: idx < chart.snowPrefix
			? idx === 0 ? 0 : chart.cumulativeNewSnow[idx - 1] ?? 0
			: null,
			timeLabel: formatTooltipTime(time)
		});
	}

	async function downloadPng() {
		if (!svgEl || !chart || pngBusy) return;
		$$invalidate(7, pngBusy = true);

		try {
			const clone = svgEl.cloneNode(true);
			clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			clone.setAttribute('width', '1080');
			clone.setAttribute('height', '1002');
			const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
			style.textContent = 'text{font-family:Arial,sans-serif}.plot-bg,.band-bg{fill:#101b22;stroke:#29404d}.terrain-zone{fill:#17313a}.grid{stroke:#29404d}.axis{fill:#9fb0ba;font-size:8px}.section-label{fill:#dce8ee;font-size:7px;font-weight:700}.section-label tspan{fill:#72838d}.snowline-line{fill:none;stroke:#67d7ff;stroke-width:2.7}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-tag{fill:#ffbd75;font-size:6px}.min24-line{stroke:#9fe9ff;stroke-dasharray:2 3}.min24-dot{fill:#0d151b;stroke:#9fe9ff;stroke-width:2}.min24-tag{fill:#bdefff;font-size:6px}.precip-bar{fill:#3794b8}.precip-bar.wet{fill:#64d4f5}.phase-snow{fill:#b2b2b2}.phase-wet-snow{fill:#569456}.phase-mix{fill:#95a109}.phase-rain{fill:#0099b6}.phase-ice-pellets{fill:#510c0f}.phase-freezing-rain{fill:#900096}.phase-block{opacity:.94}.phase-legend-svg text{fill:#d4dfe6;font-size:9px}.new-snow-line{fill:none;stroke:#82e398;stroke-width:2}.new-snow-area{fill:#82e398;opacity:.18}.now-line{stroke:#ff6759}.now-tag-bg{fill:#ff6759}.now-tag{fill:#fff;font-size:7px}.cursor{stroke:#dce8ee;stroke-dasharray:2 3}.current-dot{fill:#fff;stroke:#67d7ff;stroke-width:2}.crossing-line{stroke:#ffe05b;stroke-dasharray:3 3}.crossing-dot{fill:#111;stroke:#ffe05b;stroke-width:2}.empty-band{fill:#8596a2;font-size:7px}';
			clone.insertBefore(style, clone.firstChild);

			const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
				url = URL.createObjectURL(blob),
				img = new Image();

			await new Promise((resolve, reject) => {
					img.onload = () => resolve();
					img.onerror = () => reject();
					img.src = url;
				});

			const canvas = document.createElement('canvas');
			canvas.width = 1200;
			canvas.height = 1430;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('No canvas');
			ctx.fillStyle = '#0d151b';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = '#ffffff';
			ctx.font = '700 44px Arial';
			ctx.fillText('Wintry forecast', 52, 62);
			ctx.fillStyle = '#cbd7de';
			ctx.font = '24px Arial';
			ctx.fillText(placeName || 'Selected point', 52, 100);
			ctx.fillStyle = '#72cef4';
			ctx.font = '20px Arial';
			ctx.fillText(chart.validLabel, 52, 132);
			ctx.drawImage(img, 45, 155, 1110, 1030);
			URL.revokeObjectURL(url);
			let y = 1217;
			ctx.fillStyle = '#ffffff';
			ctx.font = '700 29px Arial';

			ctx.fillText(
				chart.currentPhase
				? precipitationLabel(chart.currentPhase)
				: chart.currentCondition,
				52,
				y
			);

			y += 34;
			ctx.fillStyle = '#b8c8d1';
			ctx.font = '22px Arial';

			ctx.fillText(
				`Snowline ${chart.currentSnowline === null
				? 'WBZ unresolved'
				: formatElevation(chart.currentSnowline, units)}   ·   Precip ${formatPrecip(chart.currentPrecip, units)}`,
				52,
				y
			);

			y += 38;
			ctx.fillStyle = '#dfeaf0';
			ctx.font = '700 21px Arial';

			ctx.fillText(
				`Next 24 h · min estimated snowline ${formatElevation(chart.min24Snowline, units)} · new snow ${chart.window24Complete
				? formatSnow(chart.newSnow24h, units)
				: 'unavailable'}`,
				52,
				y
			);

			if (chart.nextChangeLabel) {
				y += 30;
				ctx.fillStyle = '#e5cf7c';
				ctx.font = '700 20px Arial';
				ctx.fillText(chart.nextChangeLabel, 52, y);
			}

			y += 30;
			ctx.fillStyle = '#8799a4';
			ctx.font = '18px Arial';
			ctx.fillText('Estimated new snow, not existing snowpack. ECMWF profile and Windy terrain.', 52, y);
			const png = await new Promise((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('PNG failed')), 'image/png'));
			const href = URL.createObjectURL(png), a = document.createElement('a');
			a.href = href;
			a.download = `wintry-forecast-${(placeName || 'point').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(href), 30000);
		} catch(e) {
			console.warn('Wintry forecast PNG export failed', e);
		} finally {
			$$invalidate(7, pngBusy = false);
		}
	}

	onMount(() => {
		const width = Math.min(430, window.innerWidth - 16);

		$$invalidate(10, position = {
			x: Math.max(6, (window.innerWidth - width) / 2),
			y: window.innerWidth <= 520 ? 34 : 54
		});

		$$invalidate(22, realNow = Date.now());
		realNowTimer = setInterval(() => $$invalidate(22, realNow = Date.now()), 30000);

		try {
			const t = store.get('timestamp');
			if (typeof t === 'number') $$invalidate(5, timestamp = t);

			timestampListener = store.on('timestamp', v => {
				const n = Number(v);
				if (Number.isFinite(n)) $$invalidate(5, timestamp = n);
			});
		} catch {
			
		}
	});

	onDestroy(() => {
		if (realNowTimer) clearInterval(realNowTimer);
		window.removeEventListener('pointermove', dragMove);
		window.removeEventListener('pointerup', stopDrag);

		if (timestampListener !== null) try {
			store.off(timestampListener);
		} catch {
			
		}
	});

	const click_handler = () => dispatch('close');
	const click_handler_1 = () => $$invalidate(0, tab = 'graph');
	const click_handler_2 = () => $$invalidate(0, tab = 'sounding');

	function svg_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			svgEl = $$value;
			$$invalidate(9, svgEl);
		});
	}

	const pointerleave_handler = () => $$invalidate(11, tooltip = null);
	const click_handler_3 = () => jumpToCrossing(Number(crossing.crossingTime));

	function div4_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			chartShell = $$value;
			$$invalidate(8, chartShell);
		});
	}

	$$self.$$set = $$props => {
		if ('point' in $$props) $$invalidate(1, point = $$props.point);
		if ('terrainM' in $$props) $$invalidate(2, terrainM = $$props.terrainM);
		if ('placeName' in $$props) $$invalidate(3, placeName = $$props.placeName);
		if ('tab' in $$props) $$invalidate(0, tab = $$props.tab);
		if ('units' in $$props) $$invalidate(4, units = $$props.units);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*point, terrainM, timestamp*/ 38) {
			$$invalidate(6, crossing = terrainCrossingState(point, terrainM, timestamp));
		}

		if ($$self.$$.dirty[0] & /*point, terrainM, timestamp*/ 38) {
			$$invalidate(13, event = nextWintryEvent(point, terrainM, timestamp));
		}

		if ($$self.$$.dirty[0] & /*point, terrainM, timestamp, crossing, realNow, units*/ 4194422) {
			$$invalidate(12, chart = buildChart(point, terrainM, timestamp, crossing?.crossingTime ?? null, realNow, units));
		}

		if ($$self.$$.dirty[0] & /*timestamp, realNow*/ 4194336) {
			$$invalidate(14, showNow = Math.abs(timestamp - realNow) > 90 * 60_000);
		}
	};

	return [
		tab,
		point,
		terrainM,
		placeName,
		units,
		timestamp,
		crossing,
		pngBusy,
		chartShell,
		svgEl,
		position,
		tooltip,
		chart,
		event,
		showNow,
		dispatch,
		startDrag,
		jumpToCrossing,
		jumpToEvent,
		resetToNow,
		handlePointer,
		downloadPng,
		realNow,
		click_handler,
		click_handler_1,
		click_handler_2,
		svg_binding,
		pointerleave_handler,
		click_handler_3,
		div4_binding
	];
}

class SnowlineChart extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$2,
			create_fragment$2,
			safe_not_equal,
			{
				point: 1,
				terrainM: 2,
				placeName: 3,
				tab: 0,
				units: 4
			},
			add_css$1,
			[-1, -1]
		);
	}
}

/** Clip each sampled terrain-minus-WBZ triangle to the strictly positive side,
 * then intersect it with parallel screen-space diagonals. Unknown cells stay blank.
 */ function terrainHatchSegments(grid, spacing = 12) {
    if (!(spacing > 0) || !Number.isFinite(spacing)) return [];
    const segments = [];
    function triangle(vertices) {
        if (vertices.some((p)=>p.difference === null || !Number.isFinite(p.difference) || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return;
        const polygon = [];
        for(let i = 0; i < 3; i++){
            const a = vertices[i], b = vertices[(i + 1) % 3], da = a.difference, db = b.difference;
            if (da > 0) polygon.push(a);
            if (da > 0 !== db > 0) {
                const f = da / (da - db);
                polygon.push({
                    x: a.x + f * (b.x - a.x),
                    y: a.y + f * (b.y - a.y),
                    difference: 0
                });
            }
        }
        if (polygon.length < 3) return;
        const offsets = polygon.map((p)=>p.x + p.y), lo = Math.ceil(Math.min(...offsets) / spacing) * spacing, hi = Math.max(...offsets);
        for(let k = lo; k <= hi; k += spacing){
            const hits = [];
            for(let i = 0; i < polygon.length; i++){
                const a = polygon[i], b = polygon[(i + 1) % polygon.length], den = b.x + b.y - a.x - a.y;
                if (Math.abs(den) < 1e-9) continue;
                const f = (k - a.x - a.y) / den;
                if (f >= 0 && f <= 1) hits.push([
                    a.x + f * (b.x - a.x),
                    a.y + f * (b.y - a.y)
                ]);
            }
            hits.sort((a, b)=>a[0] - b[0]);
            if (hits.length >= 2) {
                const a = hits[0], b = hits[hits.length - 1];
                if (Math.hypot(a[0] - b[0], a[1] - b[1]) > .1) segments.push([
                    a,
                    b
                ]);
            }
        }
    }
    for(let r = 0; r < grid.length - 1; r++)for(let c = 0; c < grid[r].length - 1; c++){
        const a = grid[r][c], b = grid[r][c + 1], d = grid[r + 1]?.[c], e = grid[r + 1]?.[c + 1];
        if (!a || !b || !d || !e || [
            a,
            b,
            d,
            e
        ].some((p)=>p.difference === null)) continue;
        triangle([
            a,
            b,
            e
        ]);
        triangle([
            a,
            e,
            d
        ]);
    }
    // Join touching fragments on the same stripe. Keep genuine gaps (including
    // missing terrain) open, and avoid darker overlaps at triangle boundaries.
    const stripes = new Map();
    for (const segment of segments){
        const stripe = Math.round((segment[0][0] + segment[0][1]) / spacing);
        const parts = stripes.get(stripe) ?? [];
        parts.push(segment);
        stripes.set(stripe, parts);
    }
    const joined = [];
    for (const parts of stripes.values()){
        parts.sort((a, b)=>a[0][0] - b[0][0]);
        let current = null;
        for (const part of parts){
            if (current && part[0][0] <= current[1][0] + 1e-7) {
                if (part[1][0] > current[1][0]) current[1] = part[1];
            } else {
                current = [
                    part[0],
                    part[1]
                ];
                joined.push(current);
            }
        }
    }
    return joined;
}

// Same colours as the forecast's precipitation-type legend.
const PRECIP_TYPE_COLOURS = {
    snow: '#b2b2b2',
    'wet-snow': '#569456',
    mix: '#95a109',
    rain: '#0099b6',
    'ice-pellets': '#510c0f',
    'freezing-rain': '#900096'
};
const PRECIP_SHADES = [
    {
        label: 'Precipitation',
        tone: 0
    }
];
const PRECIP_SHADING_OPACITY = 1;
const PRECIP_DETAIL_MIN_ZOOM = 8;
/** Zero, missing and invalid precipitation never produce a wet overlay. */ function precipitationShade(mm3h, zoom = Infinity) {
    if (mm3h === null || !Number.isFinite(mm3h) || mm3h <= 0) return null;
    return PRECIP_SHADES[0];
}
/** Strictly dry, known samples only. Unknown or wet samples leave gaps. */ function dryTerrainDifference(mm3h, terrain, wbz) {
    if (mm3h !== 0 || terrain === null || wbz === null || !Number.isFinite(terrain) || !Number.isFinite(wbz)) return null;
    return terrain - wbz;
}

const cloud = '<path d="M7 17H25a5 5 0 0 0-.6-10 7 7 0 0 0-13-1A5.6 5.6 0 0 0 7 17Z"/>';
const drop = '<path d="M11 20l-2 4m11-4-2 4m-2 2-2 3"/>';
const snow = '<path d="M16 19v11m-5-8 10 5m-10 0 10-5m-5-3-2 2m2-2 2 2m-2 9-2-2m2 2 2-2"/>';
const shapes = {
    rain: cloud + drop,
    snow: '<path d="M16 3v26M5 9l22 14M5 23 27 9M16 3l-4 4m4-4 4 4m-4 22-4-4m4 4 4-4M5 9l1 5m-1-5 5-1m17 15-5 1m5-1-1-5M5 23l5 1m-5-1 1-5M27 9l-5-1m5 1-1 5"/>',
    'wet-snow': cloud + snow + '<path d="M7 21l-2 4m21-4-2 4"/>',
    mix: cloud + '<path d="M7 21l-2 4m9-4-2 4m11-5v9m-4-7 8 5m-8 0 8-5"/>',
    'freezing-rain': cloud + drop + '<path d="M6 15v4m10-4v4m10-4v4"/>',
    'ice-pellets': cloud + '<circle cx="9" cy="23" r="1.8"/><circle cx="22" cy="23" r="1.8"/><circle cx="15" cy="28" r="1.8"/>'
};
/** Compact vector icons keep the requested colours on every browser. */ function precipitationIconSvg(type) {
    return `<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="${PRECIP_TYPE_COLOURS[type]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${shapes[type]}</svg>`;
}

const R = 6378137;
const project = (lat)=>R * Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) * Math.PI / 360));
const latitude = (y)=>(2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * 180 / Math.PI;
const longitude = (x)=>x / R * 180 / Math.PI;
/** Global anchors survive small pans and zooms; the budget coarsens broad overviews. */ function metricGrid(bounds, metres, budget, padded = false, coarsen = 2) {
    const mid = (bounds.south + bounds.north) / 2;
    // Fixed latitude bands keep adjacent viewports on the same cacheable lattice.
    const band = Math.round(mid / 5) * 5, cos = Math.max(.087, Math.cos(band * Math.PI / 180));
    let step = metres / cos;
    const x0 = R * bounds.west * Math.PI / 180, x1 = R * bounds.east * Math.PI / 180;
    const y0 = project(bounds.south), y1 = project(bounds.north);
    const indices = ()=>({
            west: Math.floor(x0 / step),
            east: Math.ceil(x1 / step),
            south: Math.floor(y0 / step),
            north: Math.ceil(y1 / step)
        });
    let ix = indices();
    const count = ()=>padded ? (ix.east - ix.west + 1) * (ix.north - ix.south + 1) : (ix.east - ix.west) * (ix.north - ix.south);
    while(count() > budget){
        step *= coarsen;
        ix = indices();
    }
    const rows = ix.north - ix.south + (padded ? 1 : 0), cols = ix.east - ix.west + (padded ? 1 : 0);
    const points = [];
    for(let r = 0; r < rows; r++)for(let c = 0; c < cols; c++){
        const x = (ix.west + c) * step, y = (ix.south + r) * step;
        const south = Math.max(bounds.south, latitude(y)), north = Math.min(bounds.north, latitude(y + step));
        const west = Math.max(bounds.west, longitude(x)), east = Math.min(bounds.east, longitude(x + step));
        points.push({
            lat: padded ? latitude(y) : latitude((project(south) + project(north)) / 2),
            lon: padded ? longitude(x) : (west + east) / 2,
            r,
            c,
            bounds: [
                [
                    south,
                    west
                ],
                [
                    south,
                    east
                ],
                [
                    north,
                    east
                ],
                [
                    north,
                    west
                ]
            ]
        });
    }
    return {
        rows,
        cols,
        points,
        metres: step * cos
    };
}
/** API coordinates stay valid when a map viewport crosses the date line. */ function wrappedLongitude(lon) {
    return ((lon + 180) % 360 + 360) % 360 - 180;
}
/** Broad maps get a denser overview while local grids retain their 9 km target. */ function viewportWeatherGrid(bounds, zoom) {
    return metricGrid(bounds, 9000, zoom <= 5 ? 450 : 225, true, zoom <= 5 ? Math.SQRT2 : 2);
}

const TILE_SIZE = 256, RASTER_SAMPLES = 96;
/** Infer physical Web-Mercator zoom from viewport geometry, independent of wrapper zoom conventions. */ function viewportRasterZoom(width, west, east, fallback) {
    const span = east - west;
    const zoom = width > 0 && span > 0 ? Math.log2(width * 360 / (TILE_SIZE * span)) : fallback;
    return Math.max(0, Math.min(22, Math.ceil(Number.isFinite(zoom) ? zoom : fallback)));
}
function mercatorY(lat) {
    return Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) * Math.PI / 360));
}
function tilePosition(lat, lon, z) {
    const n = 2 ** z;
    return {
        x: (lon + 180) / 360 * n,
        y: (1 - mercatorY(lat) / Math.PI) / 2 * n
    };
}
function tileLocation(x, y, z) {
    const n = 2 ** z;
    return {
        lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI,
        lon: x / n * 360 - 180
    };
}
function visibleRasterTiles(b, z) {
    const a = tilePosition(b.north, b.west, z), c = tilePosition(b.south, b.east, z), n = 2 ** z;
    const out = [];
    for(let y = Math.max(0, Math.floor(a.y)); y < Math.min(n, Math.ceil(c.y)); y++)for(let x = Math.floor(a.x); x < Math.ceil(c.x); x++)out.push({
        x,
        y,
        z
    });
    return out;
}
/** Cache axes once. Missing corners stay unknown: never interpolate over a failed request. */ function weatherInterpolator(grid) {
    const row = grid.map((r, i)=>({
            i,
            p: r.find(Boolean)
        })).filter((v)=>v.p), cols = (grid[0] ?? []).map((_, i)=>({
            i,
            p: grid.map((r)=>r[i]).find(Boolean)
        })).filter((v)=>v.p);
    if (row.length < 2 || cols.length < 2) return ()=>null;
    const a = row[0], b = row.at(-1), c = cols[0], d = cols.at(-1);
    const dy = (mercatorY(b.p.lat) - mercatorY(a.p.lat)) / (b.i - a.i), dx = (d.p.lon - c.p.lon) / (d.i - c.i);
    if (!(dy > 0 && dx > 0)) return ()=>null;
    return (lat, lon)=>{
        const r = a.i + (mercatorY(lat) - mercatorY(a.p.lat)) / dy, k = c.i + (lon - c.p.lon) / dx;
        if (r < -1e-8 || k < -1e-8 || r > grid.length - 1 + 1e-8 || k > (grid[0]?.length ?? 0) - 1 + 1e-8) return null;
        const rr = Math.max(0, Math.min(grid.length - 1, r)), cc = Math.max(0, Math.min(grid[0].length - 1, k));
        const r0 = Math.floor(rr), r1 = Math.min(r0 + 1, grid.length - 1), c0 = Math.floor(cc), c1 = Math.min(c0 + 1, grid[0].length - 1), fy = rr - r0, fx = cc - c0;
        const out = [];
        for (const [i, j, w] of [
            [
                r0,
                c0,
                (1 - fy) * (1 - fx)
            ],
            [
                r0,
                c1,
                (1 - fy) * fx
            ],
            [
                r1,
                c0,
                fy * (1 - fx)
            ],
            [
                r1,
                c1,
                fy * fx
            ]
        ]){
            if (w < 1e-10) continue;
            const value = grid[i]?.[j];
            if (!value) return null;
            out.push({
                value,
                weight: w
            });
        }
        return out.length ? out : null;
    };
}
function weightedScalar(values, read) {
    let sum = 0;
    for (const v of values){
        const n = read(v.value);
        if (n === null || !Number.isFinite(n)) return null;
        sum += v.weight * n;
    }
    return sum;
}
/** Fractional wet coverage softens wet/dry edges without blending phase colours or intensity bands. */ function wetCoverage(values, read) {
    return weightedScalar(values, (p)=>{
        const n = read(p);
        return n === null || !Number.isFinite(n) ? null : n > 0 ? 1 : 0;
    });
}
/** Interpolate continuous T/Td/height by pressure, then calculate Tw; never mix categorical colours. */ function blendedProfile(values, wetBulb) {
    if (values.length === 1) return values[0].value;
    const result = [];
    for (const first of values[0].value){
        let temp = 0, dew = 0, height = 0, complete = true;
        for (const v of values){
            const p = v.value.find((p)=>p.level === first.level);
            if (!p) {
                complete = false;
                break;
            }
            temp += v.weight * p.tempC;
            dew += v.weight * p.dewpointC;
            height += v.weight * p.heightM;
        }
        if (complete) result.push({
            ...first,
            tempC: temp,
            dewpointC: Math.min(temp, dew),
            heightM: height,
            wetBulbC: wetBulb(temp, Math.min(temp, dew), first.pressureHpa)
        });
    }
    return result.sort((a, b)=>a.heightM - b.heightM);
}

function decodeTerrarium(r, g, b) {
    return r * 256 + g + b / 256 - 32768;
}
function terrainTileZoom(mapZoom) {
    return Math.max(0, Math.min(14, Math.floor(mapZoom) - 2));
}
const URL$1 = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';
/** 16 MiB decoded LRU, four concurrent requests, ten-second timeout, shared pending tiles. */ class TerrainTiles {
    cache = new Map();
    pending = new Map();
    failed = new Map();
    controllers = new Set();
    active = 0;
    waiting = [];
    alive = true;
    async ensure(bounds, zoom, isCurrent, progress) {
        const z = terrainTileZoom(zoom), nw = tilePosition(bounds.north, bounds.west, z), se = tilePosition(bounds.south, bounds.east, z);
        const pad = 1 / 256, a = tileLocation(nw.x - pad, nw.y - pad, z), b = tileLocation(se.x + pad, se.y + pad, z);
        const tiles = visibleRasterTiles({
            north: a.lat,
            south: b.lat,
            west: a.lon,
            east: b.lon
        }, z);
        let next = 0;
        await Promise.all(Array.from({
            length: Math.min(4, tiles.length)
        }, async ()=>{
            while(this.alive && isCurrent()){
                const tile = tiles[next++];
                if (!tile) return;
                await this.load(tile.x, tile.y, z);
                if (isCurrent()) progress();
            }
        }));
    }
    load(x, y, z) {
        const n = 2 ** z;
        x = (x % n + n) % n;
        const key = `${z}/${x}/${y}`;
        if (this.cache.has(key)) return Promise.resolve(true);
        const existing = this.pending.get(key);
        if (existing) return existing;
        if (Date.now() - (this.failed.get(key) ?? 0) < 30_000) return Promise.resolve(false);
        const promise = (async ()=>{
            while(this.active >= 4 && this.alive)await new Promise((resolve)=>this.waiting.push(resolve));
            if (!this.alive) return false;
            this.active++;
            const abort = new AbortController();
            this.controllers.add(abort);
            const timer = setTimeout(()=>abort.abort(), 10_000);
            try {
                const response = await fetch(`${URL$1}/${key}.png`, {
                    signal: abort.signal,
                    credentials: 'omit'
                });
                if (!response.ok) throw new Error(`DEM ${response.status}`);
                const image = await createImageBitmap(await response.blob(), {
                    colorSpaceConversion: 'none',
                    premultiplyAlpha: 'none'
                });
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d', {
                    willReadFrequently: true
                });
                if (!ctx) {
                    image.close();
                    throw new Error('DEM canvas unavailable');
                }
                ctx.drawImage(image, 0, 0);
                image.close();
                if (canvas.width !== 256 || canvas.height !== 256) throw new Error('Unexpected DEM dimensions');
                const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data, pixels = new Float32Array(canvas.width * canvas.height);
                for(let i = 0; i < pixels.length; i++)pixels[i] = rgba[i * 4 + 3] ? decodeTerrarium(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]) : NaN;
                if (!this.alive) return false;
                this.cache.set(key, {
                    pixels,
                    width: canvas.width,
                    height: canvas.height
                });
                while(this.cache.size > 64)this.cache.delete(this.cache.keys().next().value);
                this.failed.delete(key);
                return true;
            } catch  {
                if (this.alive) {
                    this.failed.set(key, Date.now());
                    while(this.failed.size > 64)this.failed.delete(this.failed.keys().next().value);
                }
                return false;
            } finally{
                clearTimeout(timer);
                this.controllers.delete(abort);
                this.pending.delete(key);
                this.active--;
                this.waiting.shift()?.();
            }
        })();
        this.pending.set(key, promise);
        return promise;
    }
    sample(lat, lon, zoom) {
        const z = terrainTileZoom(zoom), p = tilePosition(lat, lon, z), n = 2 ** z;
        // Elevation pixels represent their centres; read adjacent tiles at boundaries.
        const xx = p.x * 256 - .5, yy = p.y * 256 - .5, x0 = Math.floor(xx), y0 = Math.floor(yy), fx = xx - x0, fy = yy - y0;
        let sum = 0;
        for (const [x, y, w] of [
            [
                x0,
                y0,
                (1 - fx) * (1 - fy)
            ],
            [
                x0 + 1,
                y0,
                fx * (1 - fy)
            ],
            [
                x0,
                y0 + 1,
                (1 - fx) * fy
            ],
            [
                x0 + 1,
                y0 + 1,
                fx * fy
            ]
        ]){
            if (w < 1e-10) continue;
            const tx = (Math.floor(x / 256) % n + n) % n, ty = Math.floor(y / 256), key = `${z}/${tx}/${ty}`, tile = this.cache.get(key);
            if (!tile) return null;
            const value = tile.pixels[(y % 256 + 256) % 256 * 256 + (x % 256 + 256) % 256];
            if (!Number.isFinite(value)) return null;
            sum += w * value;
            this.cache.delete(key);
            this.cache.set(key, tile);
        }
        return sum;
    }
    retry() {
        this.failed.clear();
    }
    destroy() {
        this.alive = false;
        for (const abort of this.controllers)abort.abort();
        for (const resume of this.waiting)resume();
        this.waiting = [];
        this.cache.clear();
        this.failed.clear();
    }
}

let sequence = 0;
/** Put precipitation above weather, below Windy's geographic base map. */ function precipRasterLayer(L, url, nw, se, baseMapBucket, pane, onNativeMap) {
    const id = `wintry-precip-${Date.now()}-${++sequence}`, layer = new L.Layer();
    let gl = null, fallback = null;
    layer.onAdd = function(host) {
        gl = host.maplibreMap;
        if (gl?.addLayerToBucket) {
            try {
                onNativeMap?.(gl);
                gl.addSource(id, {
                    type: 'image',
                    url,
                    coordinates: [
                        [
                            nw.lon,
                            nw.lat
                        ],
                        [
                            se.lon,
                            nw.lat
                        ],
                        [
                            se.lon,
                            se.lat
                        ],
                        [
                            nw.lon,
                            se.lat
                        ]
                    ]
                });
                const spec = {
                    id,
                    type: 'raster',
                    source: id,
                    paint: {
                        'raster-opacity': 1,
                        'raster-fade-duration': 0,
                        'raster-resampling': 'nearest'
                    }
                };
                if (host.addMapLibreOrderedLayerToBucket) host.addMapLibreOrderedLayerToBucket(spec, baseMapBucket - 1);
                else gl.addLayerToBucket(spec, baseMapBucket - 1);
                return;
            } catch (error) {
                if (gl.getLayer(id)) gl.removeLayer(id);
                if (gl.getSource(id)) gl.removeSource(id);
                gl = null;
                console.warn('Wintry geographic layer ordering unavailable', error);
            }
        }
        fallback = L.imageOverlay(url, [
            [
                se.lat,
                nw.lon
            ],
            [
                nw.lat,
                se.lon
            ]
        ], {
            pane,
            interactive: false,
            opacity: 1,
            className: 'wintry-raster-tile'
        }).addTo(host);
    };
    layer.onRemove = function(host) {
        if (gl) {
            if (gl.getLayer(id)) {
                if (host.removeMapLibreOrderedLayer) host.removeMapLibreOrderedLayer(id);
                else gl.removeLayer(id);
            }
            if (gl.getSource(id)) gl.removeSource(id);
            gl = null;
        }
        if (fallback) {
            host.removeLayer(fallback);
            fallback = null;
        }
    };
    return layer;
}

/** Bounded, shared requests for geographic tiles used only inside wet-area masks. */ class GeographicTiles {
    cache = new Map();
    pending = new Set();
    get(url) {
        const hit = this.cache.get(url);
        if (hit) {
            this.cache.delete(url);
            this.cache.set(url, hit);
            return hit;
        }
        const request = new Promise((resolve, reject)=>{
            const img = new Image();
            img.crossOrigin = 'anonymous';
            this.pending.add(img);
            const finish = ()=>{
                clearTimeout(timeout);
                this.pending.delete(img);
                img.onload = null;
                img.onerror = null;
            };
            const timeout = setTimeout(()=>{
                finish();
                img.src = '';
                reject(new Error('Geographic tile timed out'));
            }, 10000);
            img.onload = ()=>{
                finish();
                resolve(img);
            };
            img.onerror = ()=>{
                finish();
                reject(new Error('Geographic tile unavailable'));
            };
            img.src = url;
        });
        this.cache.set(url, request);
        while(this.cache.size > 32)this.cache.delete(this.cache.keys().next().value);
        void request.catch(()=>{
            if (this.cache.get(url) === request) this.cache.delete(url);
        });
        return request;
    }
    destroy() {
        for (const img of this.pending)img.src = '';
        this.pending.clear();
        this.cache.clear();
    }
}

/** Match interval-start timestamps to profile times. Canonical internal amounts
 * remain three-hour equivalents so existing snow integration retains its units. */ function alignPrecipIntervals(times, amounts, targets) {
    const values = [], periods = [];
    for (const time of targets){
        let index = -1;
        for(let i = 0; i < times.length; i++){
            if (times[i] <= time) index = i;
            else break;
        }
        const dt = index >= 0 ? (index + 1 < times.length ? times[index + 1] - times[index] : index > 0 ? times[index] - times[index - 1] : NaN) / 3600000 : NaN;
        const raw = index >= 0 ? amounts[index] : null;
        const mm = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN;
        if (!Number.isFinite(dt) || dt <= 0 || dt > 3 || time >= times[index] + dt * 3600000 || !Number.isFinite(mm)) {
            values.push(null);
            periods.push(null);
            continue;
        }
        values.push(Math.max(0, mm) * 3 / dt);
        periods.push(dt);
    }
    return {
        '__precipMm3h': values,
        '__precipPeriodsH': periods
    };
}

function isNumericArrayLike(value) {
    if (ArrayBuffer.isView(value)) return Number(value?.length) > 0;
    if (!Array.isArray(value) || !value.length) return false;
    return value.some((item)=>typeof item === 'number' || typeof item === 'string');
}
function normaliseKey(key) {
    return key.toLowerCase().replace(/[_\s]/g, '-');
}
function isPrecipKey(key) {
    const keyNormalised = normaliseKey(key);
    return (keyNormalised.includes('precip') || keyNormalised === 'rain' || keyNormalised.startsWith('rain-') || keyNormalised === 'tp') && !keyNormalised.includes('type') && !keyNormalised.includes('snow');
}
function collectFromRecordArray(items, out) {
    if (!items.length || !items.every((item)=>!!item && typeof item === 'object' && !Array.isArray(item))) return;
    const keys = new Set();
    for (const item of items){
        for (const key of Object.keys(item))if (isPrecipKey(key)) keys.add(key);
    }
    for (const key of keys){
        const values = items.map((item)=>{
            const raw = item[key];
            const number = typeof raw === 'number' ? raw : Number(raw);
            return Number.isFinite(number) ? number : null;
        });
        if (values.some((value)=>value !== null)) out[key] = values;
    }
}
function collectPrecipFields(value, out, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 9) return;
    if (Array.isArray(value)) {
        collectFromRecordArray(value, out);
        for (const child of value)collectPrecipFields(child, out, depth + 1);
        return;
    }
    const object = value;
    if (Array.isArray(object.ts) && Array.isArray(object.precipAmount)) {
        out.__intervalTs = object.ts;
        out.__intervalPrecipMm = object.precipAmount;
    }
    for (const [key, field] of Object.entries(object)){
        if (isPrecipKey(key) && isNumericArrayLike(field)) out[key] = field;
    }
    for (const child of Object.values(object)){
        if (child && typeof child === 'object' && !isNumericArrayLike(child)) {
            collectPrecipFields(child, out, depth + 1);
        }
    }
}
/**
 * Load precipitation fields from Windy's ECMWF point feed.
 *
 * The meteogram response is authoritative for the vertical profile; this
 * supplemental request is only used to fill precipitation fields that are not
 * always exposed by the meteogram endpoint. No snow-depth request is made here:
 * the plugin's "new snow" product is calculated from forecast precipitation
 * and the terrain-aware precipitation-type diagnosis.
 */ async function loadSelectedPrecipFields(lat, lon, days = 6, model = 'ecmwf') {
    try {
        const response = await getPointForecastData(model, {
            lat,
            lon,
            step: 3,
            days,
            source: 'detail'
        });
        const out = {};
        const rawRun = response?.data?.header?.refTime ?? response?.header?.refTime;
        const run = typeof rawRun === 'number' ? rawRun > 1e12 ? rawRun : rawRun > 1e9 ? rawRun * 1000 : null : typeof rawRun === 'string' ? Date.parse(rawRun) : null;
        if (run !== null && Number.isFinite(run)) out.__precipRunTime = run;
        collectPrecipFields(response, out);
        return out;
    } catch (error) {
        console.warn('Wintry forecast precipitation request failed', lat, lon, error);
        return {};
    }
}
function alignSelectedPrecipFields(fields, targetTimes, expectedRunTime = null) {
    if (expectedRunTime !== null && typeof fields.__precipRunTime === 'number' && Math.abs(fields.__precipRunTime - expectedRunTime) > 60_000) return {};
    if (Array.isArray(fields.__intervalTs) && Array.isArray(fields.__intervalPrecipMm)) {
        return alignPrecipIntervals(fields.__intervalTs, fields.__intervalPrecipMm, targetTimes);
    }
    // Unknown time axes must not be merged by array index.
    return {};
}

const MIN_SNOWLINE_CONTOUR_M = -500;
/** Prepare display values only; retain raw diagnostics for terrain comparisons. */ function prepareSnowlineContours(rawField, interval) {
    const field = rawField.map((row)=>row.map((point)=>({
                ...point,
                value: point.value !== null && Number.isFinite(point.value) ? Math.max(MIN_SNOWLINE_CONTOUR_M, point.value) : null
            })));
    const values = field.flat().map((point)=>point.value).filter((v)=>v !== null);
    const levels = [];
    if (!values.length) return {
        field,
        levels
    };
    const min = Math.max(MIN_SNOWLINE_CONTOUR_M, Math.floor(Math.min(...values) / interval) * interval);
    const max = Math.ceil(Math.max(...values) / interval) * interval;
    // At 200 m spacing, include the floor without shifting zero/major contours.
    if (min % interval !== 0) levels.push(min);
    for(let level = Math.ceil(min / interval) * interval; level <= max; level += interval){
        levels.push(level);
    }
    return {
        field,
        levels
    };
}

function median(values) {
    if (!values.length) return 0;
    const sorted = [
        ...values
    ].sort((a, b)=>a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
}
function reconstructAxis(known, length) {
    if (!known.length) return Array.from({
        length
    }, (_, i)=>i);
    if (known.length === 1) return Array.from({
        length
    }, ()=>known[0].value);
    const ordered = [
        ...known
    ].sort((a, b)=>a.index - b.index);
    const slopes = [];
    for(let i = 1; i < ordered.length; i++){
        const di = ordered[i].index - ordered[i - 1].index;
        if (di > 0) slopes.push((ordered[i].value - ordered[i - 1].value) / di);
    }
    const step = median(slopes);
    const anchor = ordered[Math.floor(ordered.length / 2)];
    return Array.from({
        length
    }, (_, i)=>anchor.value + (i - anchor.index) * step);
}
/**
 * Contours are a visual interpolation of a regularly sampled viewport field.
 * A single failed profile request must not punch a four-cell hole in marching
 * squares. Reconstruct missing grid geometry and fill missing values from the
 * nearest available samples in grid space. The raw point data remain untouched.
 */ function continuousContourGrid(grid) {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    if (!rows || !cols) return grid;
    const valid = [];
    for(let r = 0; r < rows; r++){
        for(let c = 0; c < cols; c++){
            const p = grid[r][c];
            if (p && p.value !== null && Number.isFinite(p.value)) valid.push({
                ...p,
                r,
                c
            });
        }
    }
    if (!valid.length) return grid;
    const rowLatKnown = [];
    for(let r = 0; r < rows; r++){
        const latitudes = valid.filter((p)=>p.r === r).map((p)=>p.lat).filter(Number.isFinite);
        if (latitudes.length) rowLatKnown.push({
            index: r,
            value: latitudes.reduce((a, b)=>a + b, 0) / latitudes.length
        });
    }
    const colLonKnown = [];
    for(let c = 0; c < cols; c++){
        const longitudes = valid.filter((p)=>p.c === c).map((p)=>p.lon).filter(Number.isFinite);
        if (longitudes.length) colLonKnown.push({
            index: c,
            value: longitudes.reduce((a, b)=>a + b, 0) / longitudes.length
        });
    }
    const rowLat = reconstructAxis(rowLatKnown, rows);
    const colLon = reconstructAxis(colLonKnown, cols);
    return grid.map((row, r)=>row.map((p, c)=>{
            if (p.value !== null && Number.isFinite(p.value)) return p;
            const neighbours = valid.map((v)=>({
                    v,
                    d2: (v.r - r) ** 2 + (v.c - c) ** 2
                })).sort((a, b)=>a.d2 - b.d2).slice(0, 8);
            let weighted = 0;
            let weights = 0;
            for (const item of neighbours){
                const weight = 1 / Math.max(0.25, item.d2);
                weighted += item.v.value * weight;
                weights += weight;
            }
            return {
                lat: Number.isFinite(p.lat) && (p.lat !== 0 || rowLat[r] === 0) ? p.lat : rowLat[r],
                lon: Number.isFinite(p.lon) && (p.lon !== 0 || colLon[c] === 0) ? p.lon : colLon[c],
                value: weights > 0 ? weighted / weights : null
            };
        }));
}
function interp(p1, p2, v1, v2, level) {
    if (Math.abs(v2 - v1) < 1e-9) {
        return [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2
        ];
    }
    const f = Math.max(0, Math.min(1, (level - v1) / (v2 - v1)));
    return [
        p1[0] + f * (p2[0] - p1[0]),
        p1[1] + f * (p2[1] - p1[1])
    ];
}
/**
 * Marching-squares line segments for one contour level.
 * Grid is rows x cols; rows increase northward and columns eastward.
 *
 * Saddle cases (5 and 10) use a centre-value decider rather than a fixed
 * connection. This reduces artificial contour flips and broken-looking lines.
 */ function contourSegments(grid, level, prepared = false) {
    const out = [];
    const source = prepared ? grid : continuousContourGrid(grid);
    for(let r = 0; r < source.length - 1; r++){
        for(let c = 0; c < source[r].length - 1; c++){
            const sw = source[r][c];
            const se = source[r][c + 1];
            const nw = source[r + 1][c];
            const ne = source[r + 1][c + 1];
            if (sw.value === null || se.value === null || ne.value === null || nw.value === null) continue;
            const v = [
                sw.value,
                se.value,
                ne.value,
                nw.value
            ];
            const p = [
                [
                    sw.lat,
                    sw.lon
                ],
                [
                    se.lat,
                    se.lon
                ],
                [
                    ne.lat,
                    ne.lon
                ],
                [
                    nw.lat,
                    nw.lon
                ]
            ];
            const edgePoint = (edge)=>{
                switch(edge){
                    case 0:
                        return interp(p[0], p[1], v[0], v[1], level);
                    case 1:
                        return interp(p[1], p[2], v[1], v[2], level);
                    case 2:
                        return interp(p[2], p[3], v[2], v[3], level);
                    default:
                        return interp(p[3], p[0], v[3], v[0], level);
                }
            };
            let code = 0;
            if (v[0] >= level) code |= 1;
            if (v[1] >= level) code |= 2;
            if (v[2] >= level) code |= 4;
            if (v[3] >= level) code |= 8;
            let pairs;
            if (code === 5 || code === 10) {
                const centre = (v[0] + v[1] + v[2] + v[3]) / 4;
                const centreHigh = centre >= level;
                if (code === 5) {
                    pairs = centreHigh ? [
                        [
                            3,
                            0
                        ],
                        [
                            1,
                            2
                        ]
                    ] : [
                        [
                            3,
                            2
                        ],
                        [
                            0,
                            1
                        ]
                    ];
                } else {
                    pairs = centreHigh ? [
                        [
                            0,
                            1
                        ],
                        [
                            2,
                            3
                        ]
                    ] : [
                        [
                            0,
                            3
                        ],
                        [
                            1,
                            2
                        ]
                    ];
                }
            } else {
                const table = {
                    0: [],
                    1: [
                        [
                            3,
                            0
                        ]
                    ],
                    2: [
                        [
                            0,
                            1
                        ]
                    ],
                    3: [
                        [
                            3,
                            1
                        ]
                    ],
                    4: [
                        [
                            1,
                            2
                        ]
                    ],
                    6: [
                        [
                            0,
                            2
                        ]
                    ],
                    7: [
                        [
                            3,
                            2
                        ]
                    ],
                    8: [
                        [
                            2,
                            3
                        ]
                    ],
                    9: [
                        [
                            0,
                            2
                        ]
                    ],
                    11: [
                        [
                            1,
                            2
                        ]
                    ],
                    12: [
                        [
                            1,
                            3
                        ]
                    ],
                    13: [
                        [
                            0,
                            1
                        ]
                    ],
                    14: [
                        [
                            3,
                            0
                        ]
                    ],
                    15: []
                };
                pairs = table[code] ?? [];
            }
            for (const pair of pairs){
                out.push([
                    edgePoint(pair[0]),
                    edgePoint(pair[1])
                ]);
            }
        }
    }
    return out;
}
function pointKey(p) {
    // Shared cell-edge intersections should be identical; rounding protects
    // against tiny floating-point differences without visibly moving a line.
    return `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
}
/** Stitch touching marching-squares segments into continuous polylines. */ function stitchSegments(segments) {
    if (!segments.length) return [];
    const endpointMap = new Map();
    const used = new Array(segments.length).fill(false);
    const addEndpoint = (key, index)=>{
        const list = endpointMap.get(key);
        if (list) list.push(index);
        else endpointMap.set(key, [
            index
        ]);
    };
    segments.forEach((segment, i)=>{
        addEndpoint(pointKey(segment[0]), i);
        addEndpoint(pointKey(segment[1]), i);
    });
    const extend = (line, atStart)=>{
        while(true){
            const end = atStart ? line[0] : line[line.length - 1];
            const candidates = endpointMap.get(pointKey(end)) ?? [];
            const nextIndex = candidates.find((i)=>!used[i]);
            if (nextIndex === undefined) return;
            used[nextIndex] = true;
            const seg = segments[nextIndex];
            const aMatches = pointKey(seg[0]) === pointKey(end);
            const nextPoint = aMatches ? seg[1] : seg[0];
            if (atStart) line.unshift(nextPoint);
            else line.push(nextPoint);
            // Closed contour: stop once both ends meet.
            if (line.length > 3 && pointKey(line[0]) === pointKey(line[line.length - 1])) {
                return;
            }
        }
    };
    const lines = [];
    for(let i = 0; i < segments.length; i++){
        if (used[i]) continue;
        used[i] = true;
        const line = [
            segments[i][0],
            segments[i][1]
        ];
        extend(line, false);
        extend(line, true);
        lines.push(line);
    }
    return lines;
}
/** Reconstruct missing samples once per frame, rather than once per elevation. */ function contourLinesForLevels(grid, levels) {
    const source = continuousContourGrid(grid);
    return new Map(levels.map((level)=>[
            level,
            stitchSegments(contourSegments(source, level, true))
        ]));
}

const PROFILE_CACHE_TTL_MS = 15 * 60_000;
function isOlderRun(run, activeRun) {
    return run !== null && activeRun !== null && run < activeRun - 60_000;
}
function profileIsFresh(fetchedAt, run, activeRun, now = Date.now()) {
    return Number.isFinite(fetchedAt) && now >= fetchedAt && now - fetchedAt < PROFILE_CACHE_TTL_MS && (activeRun === null || run !== null && Math.abs(run - activeRun) < 60_000);
}

const AUTO_REFRESH_MS = 15 * 60_000;
const RETRY_REFRESH_MS = 2 * 60_000;
function automaticRefreshDue(state, now = Date.now()) {
    if (!state.enabled || state.busy || state.hidden || !state.online) return false;
    const elapsed = now - state.lastAttempt;
    return elapsed < 0 || elapsed >= (state.failed ? RETRY_REFRESH_MS : AUTO_REFRESH_MS);
}

// Submitted place searches and user-requested reverse lookups share one queue.
// Public Nominatim does not support autocomplete. Cache and pace this client;
// a multi-user deployment must also enforce the provider's application-wide limit.
const cache = new Map();
let queue = Promise.resolve();
let lastStarted = 0;
function geocode(path, params, signal) {
    const url = `https://nominatim.openstreetmap.org/${path}?${params}`;
    const request = queue.catch(()=>{}).then(async ()=>{
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        if (cache.has(url)) return cache.get(url);
        const wait = Math.max(0, 1100 - (Date.now() - lastStarted));
        if (wait) await new Promise((resolve)=>setTimeout(resolve, wait));
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        lastStarted = Date.now();
        const response = await fetch(url, {
            signal,
            headers: {
                Accept: 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Place lookup failed (${response.status})`);
        const data = await response.json();
        cache.set(url, data);
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return data;
    });
    queue = request;
    return request;
}

/* src\plugin.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1tts9re", ".snowline-click-label>span>b{text-shadow:0 0 1px #fff}.snowline-point-place{font-size:12px;line-height:1.3;font-weight:750;color:#d9e7ef;overflow-wrap:anywhere;max-height:3.9em;overflow:auto;padding:0 2px}.wintry-point-pointer{background:transparent!important;border:0!important;pointer-events:none !important}.wintry-point-pointer>span{display:block;width:14px;height:14px;box-sizing:border-box;border:2px solid #fff;border-radius:50%;background:var(--probe-accent, #fff);box-shadow:0 0 0 2px rgba(0, 0, 0, 0.55)}.storm-legend.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:9px;color:#f5df91;margin-top:5px}.wintry-storm-symbol{background:none!important;border:0!important;pointer-events:none !important}.wintry-storm-symbol span{font-size:23px;color:#ffe04b;text-shadow:0 1px 2px #111, 0 0 3px #111;line-height:28px}.wintry-precip-icon{background:none!important;border:0!important;pointer-events:none !important}.wintry-precip-icon span{display:block;width:28px;height:28px;background:#102633db;border-radius:6px;box-shadow:0 1px 3px #0005}.wintry-precip-icon svg{width:25px;height:25px;padding:1.5px;filter:drop-shadow(0 0 0.75px #ffffffc0)}.layer-controls.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:grid;grid-template-columns:repeat(2, 1fr);gap:6px 14px;margin-top:8px;font-size:12px;font-weight:700}.layer-controls.svelte-1tts9re label.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;gap:5px;cursor:pointer}.layer-controls.svelte-1tts9re input.svelte-1tts9re.svelte-1tts9re{accent-color:#67d7ff;margin:0;width:15px;height:15px}.zoom-hint.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-top:8px;font-size:11px;color:#b5cbd7}.layer-controls.svelte-1tts9re label.unavailable.svelte-1tts9re.svelte-1tts9re{opacity:0.45;cursor:not-allowed}.layer-controls.svelte-1tts9re label.unavailable input.svelte-1tts9re.svelte-1tts9re{cursor:not-allowed}.shade-types.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:grid;grid-template-columns:repeat(3, 1fr);gap:5px 3px;margin-top:5px;font-size:9px;color:#d7e3e9}.shade-types.svelte-1tts9re span.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;gap:4px;white-space:nowrap}#plugin-windy-plugin-snowline-map-100m{height:auto!important;width:auto!important;padding:0!important;background:transparent!important;overflow:visible !important}.refresh-error.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-top:7px;font-size:11px;line-height:1.4;color:#ffcb91}.refresh-error.svelte-1tts9re button.svelte-1tts9re.svelte-1tts9re{color:inherit;background:none;border:0;text-decoration:underline;cursor:pointer}.forecast-quality{margin-top:5px;color:#edc881;font-size:10px;line-height:1.3}.hatch-legend.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:9px;line-height:1.4;color:#b9d8e6;margin:5px 0}.hatch-legend.svelte-1tts9re span.svelte-1tts9re.svelte-1tts9re{color:#ef70cf;font-weight:700;margin-right:4px}.snowline-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{box-sizing:border-box;width:240px;max-width:calc(100vw - 28px);padding:8px;border-radius:9px;background:rgba(38, 42, 46, 0.96);color:white;box-shadow:0 4px 16px rgba(0, 0, 0, 0.28)}.top-row.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;justify-content:space-between;gap:10px}.top-controls.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;gap:6px}.title.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:16px;font-weight:850;letter-spacing:-0.2px}.switch.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;gap:5px;height:24px;padding:0 7px 0 5px;border:1px solid rgba(255, 255, 255, 0.11);border-radius:7px;background:rgba(255, 255, 255, 0.035);font-size:9px;font-weight:850;white-space:nowrap;cursor:pointer}.switch.svelte-1tts9re input.svelte-1tts9re.svelte-1tts9re{appearance:none;-webkit-appearance:none;position:relative;margin:0;width:24px;height:14px;border:0;border-radius:8px;background:rgba(255, 255, 255, 0.16);cursor:pointer;transition:background 0.15s ease}.switch.svelte-1tts9re input.svelte-1tts9re.svelte-1tts9re:after{content:'';position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:#aebbc2;transition:transform 0.15s ease, background 0.15s ease}.switch.svelte-1tts9re input.svelte-1tts9re.svelte-1tts9re:checked{background:rgba(80, 190, 255, 0.35)}.switch.svelte-1tts9re input.svelte-1tts9re.svelte-1tts9re:checked:after{transform:translateX(10px);background:#8ee2ff}.hide-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:24px;height:24px;padding:0;border:1px solid rgba(255, 255, 255, 0.1);border-radius:7px;background:rgba(255, 255, 255, 0.035);color:rgba(255, 255, 255, 0.74);font-size:15px;font-weight:800;cursor:pointer}.hide-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re:hover{background:rgba(255, 255, 255, 0.075);color:#fff}.show-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{padding:7px 10px;border:1px solid rgba(255, 255, 255, 0.16);border-radius:8px;background:rgba(38, 42, 46, 0.96);color:#fff;box-shadow:0 3px 12px rgba(0, 0, 0, 0.24);font-size:11px;font-weight:800;cursor:pointer}.status-pill.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;padding:4px 7px;border-radius:6px;background:rgba(10, 14, 18, 0.72);color:rgba(255, 255, 255, 0.92);font-size:10px;font-weight:700}.status-dot.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:7px;height:7px;border-radius:50%;background:#70d7ff;animation:svelte-1tts9re-snowline-pulse 1s ease-in-out infinite}@keyframes svelte-1tts9re-snowline-pulse{0%,100%{opacity:0.45;transform:scale(0.85)}50%{opacity:1;transform:scale(1)}}.info-overlay.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0, 0, 0, 0.3)}.info-window.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:min(360px, calc(100vw - 24px));max-height:min(74vh, 540px);overflow:hidden;border:1px solid rgba(80, 190, 255, 0.48);border-radius:10px;background:rgba(24, 28, 32, 0.99);color:white;box-shadow:0 8px 30px rgba(0, 0, 0, 0.48)}.info-head.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{display:flex;justify-content:space-between;align-items:center;padding:9px 10px 7px;border-bottom:1px solid rgba(255, 255, 255, 0.1);font-size:12px}.info-head.svelte-1tts9re button.svelte-1tts9re.svelte-1tts9re{width:22px;height:22px;border:0;border-radius:6px;background:rgba(255, 255, 255, 0.08);color:white;font-size:17px;cursor:pointer}.info-body.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{max-height:calc(min(74vh, 540px) - 40px);overflow-y:auto;padding:9px 10px 10px;font-size:10px;line-height:1.4;color:rgba(255, 255, 255, 0.84)}.info-body.svelte-1tts9re>div.svelte-1tts9re+div.svelte-1tts9re{margin-top:8px}.info-caveat.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{padding-top:8px;border-top:1px solid rgba(255, 255, 255, 0.1);color:rgba(255, 228, 92, 0.9)}.snowline-label{text-align:center;pointer-events:none}.snowline-label,.snowline-click-label{background:transparent!important;border:0 !important}.snowline-label span{display:inline-block;padding:1px 4px 1px 6px;border-radius:3px;border-left:4px solid var(--snowline-color, white);background:rgba(15, 17, 20, 0.86);color:white;font-size:10px;font-weight:800;white-space:nowrap;text-shadow:0 1px 2px rgba(0, 0, 0, 0.8);box-shadow:0 0 0 1px rgba(255, 255, 255, 0.12)}.snowline-label-major span{padding-left:7px;border-left-width:5px;background:rgba(10, 13, 16, 0.92);font-weight:900;box-shadow:0 0 0 1px rgba(255, 255, 255, 0.18), 0 2px 5px rgba(0, 0, 0, 0.28)}.snowline-click-label{pointer-events:none !important}.snowline-click-label>span{position:absolute;bottom:20px;left:0;transform:translateX(-50%);pointer-events:auto;display:flex;flex-direction:column;gap:6px;width:228px;min-height:146px;box-sizing:border-box;padding:40px 9px 9px;border-radius:14px;border:1px solid rgba(255, 255, 255, 0.11);border-top:2px solid var(--probe-accent, rgba(255, 255, 255, 0.4));border-bottom:3px solid var(--snowline-color, white);background:linear-gradient(180deg, rgba(11, 17, 21, 0.985), rgba(7, 12, 16, 0.99));color:#fff;text-align:center;white-space:normal;text-shadow:none;box-shadow:0 10px 30px rgba(0, 0, 0, 0.54)}.snowline-card-kicker{position:absolute;top:12px;left:74px;right:74px;color:#7f929e;font-size:6px;line-height:1;font-weight:900;letter-spacing:1.15px;text-align:center;white-space:nowrap;pointer-events:none}.snowline-label-close,.snowline-label-share,.snowline-label-chart,.snowline-label-favourite{position:absolute;top:7px;height:27px;padding:0;border:1px solid rgba(255, 255, 255, 0.085);border-radius:8px;background:rgba(255, 255, 255, 0.045);color:#dfe9ee;font-size:12px;line-height:25px;font-weight:800;text-shadow:none;cursor:pointer;pointer-events:auto;transition:background 0.12s ease, border-color 0.12s ease}.snowline-label-close:hover,.snowline-label-share:hover,.snowline-label-chart:hover,.snowline-label-favourite:hover{background:rgba(255, 255, 255, 0.09);border-color:rgba(255, 255, 255, 0.16)}.snowline-label-close{right:7px;width:27px;font-size:17px}.snowline-label-share{right:40px;width:27px;font-size:0;background-repeat:no-repeat;background-position:center;background-size:14px;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'/%3E%3Ccircle cx='6' cy='12' r='3'/%3E%3Ccircle cx='18' cy='19' r='3'/%3E%3Cpath d='M8.6 10.5l6.8-4M8.6 13.5l6.8 4'/%3E%3C/svg%3E\")}.snowline-label-chart{left:7px;width:29px;font-size:15px}.snowline-label-favourite{left:42px;width:29px;font-size:16px;color:#aab6bd}.snowline-label-favourite.saved{color:#ffe45c;border-color:rgba(255, 228, 92, 0.42);background:rgba(255, 228, 92, 0.08)}.snowline-click-label b{display:block;padding:4px 7px 2px;border-radius:8px;background:transparent;color:var(--probe-accent, white);font-size:15px;line-height:1.05;font-weight:900;letter-spacing:0.25px}.snowline-card-dry>span>b{padding:3px 7px 1px;background:transparent;font-size:12px;letter-spacing:0.8px;opacity:0.95}.snowline-label-detail{width:100%}.snowline-position{padding:6px 8px;border-radius:8px;background:rgba(255, 255, 255, 0.055);color:var(--probe-accent, white);line-height:1.05}.snowline-position strong{display:block;font-size:11px;font-weight:900}.snowline-position small{display:block;margin-top:3px;color:rgba(255, 255, 255, 0.68);font-size:7.5px;font-weight:750}.snowline-label-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%}.snowline-label-grid span,.snowline-outlook-grid span{min-width:0;padding:6px 4px 5px;border-radius:8px;background:rgba(255, 255, 255, 0.028);border:1px solid rgba(255, 255, 255, 0.045);text-align:center}.snowline-label-grid small,.snowline-outlook-grid small{display:block;color:#7f919b;font-size:6.2px;line-height:1;text-transform:uppercase;letter-spacing:0.42px;font-weight:800}.snowline-label-grid strong,.snowline-outlook-grid strong{display:block;margin-top:4px;color:#eef5f8;font-size:10.5px;line-height:1;font-weight:900}.metric-terrain strong{color:#ffd39a}.metric-snowline strong{color:#dff6ff}.metric-precip strong{color:#9fe5ff}.snowline-label-grid.has-precip .metric-precip{grid-column:-1}.snowline-outlook{padding:5px;border:1px solid rgba(110, 203, 255, 0.08);border-radius:8px;background:rgba(60, 150, 205, 0.035)}.snowline-outlook-title{margin-bottom:4px;color:#79badc;font-size:6.5px;font-weight:900;letter-spacing:0.75px}.snowline-outlook-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}.snowline-outlook-grid span{padding:4px 3px;background:rgba(255, 255, 255, 0.028)}.snowline-outlook-grid strong{font-size:8.8px}.snowline-no-snow strong{color:#8f9da5;font-weight:700}.snowline-transition{margin-top:4px;padding:4px 5px;border-radius:6px;background:rgba(255, 255, 255, 0.035);color:#dce9ef;font-size:8px;line-height:1.12;font-weight:800}.snowline-valid{margin:-1px 0 1px;color:#8799a4;font-size:7.2px;line-height:1;font-weight:800;text-align:center}.snowline-compact-relation{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;box-sizing:border-box;padding:5px 7px;border-radius:8px;background:rgba(255, 255, 255, 0.025);color:var(--probe-accent, white);font-size:8.2px;line-height:1.1;font-weight:850;text-align:left}.snowline-compact-relation strong{display:inline!important;padding:0!important;background:none!important;color:inherit!important;font-size:8px!important;letter-spacing:0 !important}.snowline-compact-relation small{display:none}.snowline-compact-relation span{color:#aebbc2;font-weight:750;white-space:nowrap}.snowline-event-line{width:100%;box-sizing:border-box;padding:6px 7px;border:0;border-radius:8px;background:rgba(110, 203, 255, 0.045);color:#d8e5eb;text-align:left;font-family:inherit;font-size:7.8px;line-height:1.2;font-weight:800}button.snowline-event-line{display:flex;align-items:center;justify-content:space-between;gap:6px;cursor:pointer;pointer-events:auto}button.snowline-event-line:hover{background:rgba(110, 203, 255, 0.11)}button.snowline-event-line span{flex:0 0 auto;color:#8edcff;font-size:14px;line-height:8px}.snowline-loading{padding:20px 0 14px;color:#9fb0ba;font-size:10px}.snowline-probe-above>span{background:linear-gradient(180deg, rgba(8, 25, 34, 0.99), rgba(8, 14, 18, 0.99))}.snowline-probe-below>span{background:linear-gradient(180deg, rgba(32, 21, 12, 0.99), rgba(18, 13, 10, 0.99))}.snowline-probe-near>span{background:linear-gradient(180deg, rgba(29, 27, 11, 0.99), rgba(17, 16, 9, 0.99))}.snowline-card-hazard>span{border-top-color:#c184ff !important;box-shadow:0 0 0 1px rgba(193, 132, 255, 0.35), 0 12px 32px rgba(77, 27, 107, 0.58)}.snowline-card-hazard>span>b{color:#e7c8ff !important;background:rgba(174, 91, 230, 0.12) !important}@media(max-width: 520px){.info-overlay.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{align-items:flex-start;padding-top:54px}.snowline-click-label>span{width:220px;min-height:142px;padding:40px 8px 8px}.snowline-card-kicker{left:72px;right:72px}.snowline-click-label b{font-size:13px}.snowline-card-dry>span>b{font-size:10.5px}.snowline-position strong{font-size:10.5px}.snowline-label-grid strong,.snowline-outlook-grid strong{font-size:8.5px}}.snowline-label-chart{left:7px;width:69px;font-size:10px}.snowline-label-favourite{left:81px;width:46px;font-size:10px}.snowline-label-share{right:40px;width:45px;background-image:none;font-size:10px}.snowline-card-kicker{display:none}.snowline-valid{font-size:10px;line-height:1.25}.snowline-label-grid small{font-size:9px;line-height:1.2}.snowline-label-grid strong{font-size:13px;line-height:1.2}.snowline-event-line{font-size:11px;line-height:1.4;padding:8px}.snowline-compact-relation,.snowline-compact-relation strong{font-size:10px!important;line-height:1.3}.title.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:13px;white-space:nowrap}.top-row.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re,.top-controls.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{gap:3px}.info-overlay.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{z-index:10030}.snowline-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re,.show-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{position:fixed;left:max(16px, env(safe-area-inset-left, 0px));bottom:calc(var(--wintry-bottom-clearance, 84px) + env(safe-area-inset-bottom, 0px));z-index:10005;box-sizing:border-box;max-width:calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))}.snowline-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:280px;padding:10px;border:1px solid #355363;border-radius:12px;background:linear-gradient(155deg, #142b3b, #0c1822);max-height:calc(100vh - var(--wintry-bottom-clearance, 84px) - 80px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px));max-height:calc(100dvh - var(--wintry-bottom-clearance, 84px) - 80px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px));overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#47677a #142b3b}@media(max-width: 600px){.snowline-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re,.show-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{left:max(12px, env(safe-area-inset-left, 0px));right:max(12px, env(safe-area-inset-right, 0px));bottom:calc(var(--wintry-bottom-clearance, 88px) + env(safe-area-inset-bottom, 0px));margin-inline:auto;max-width:calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))}.snowline-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:440px;border-radius:16px;padding:10px 12px;max-height:min(45vh, calc(100vh - var(--wintry-bottom-clearance, 88px) - 64px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px)));max-height:min(45dvh, calc(100dvh - var(--wintry-bottom-clearance, 88px) - 64px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px)))}.show-panel.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:max-content;min-height:44px}.top-row.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{flex-wrap:wrap}}.title.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:18px}.top-controls.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{gap:4px}.hide-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:30px;height:34px}.switch.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{height:34px;font-size:11px}.hatch-legend.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:11px;margin:9px 0}.point-tools.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-top:12px;padding:12px;background:#192f3d;border-radius:10px}.point-tools.svelte-1tts9re strong.svelte-1tts9re.svelte-1tts9re{display:block;font-size:13px;overflow-wrap:anywhere}.point-tools.svelte-1tts9re>div.svelte-1tts9re.svelte-1tts9re{display:flex;gap:8px;margin-top:9px}.point-tools.svelte-1tts9re button.svelte-1tts9re.svelte-1tts9re{flex:1;min-height:40px;border:1px solid #487286;border-radius:8px;background:#244757;color:#fff;font-size:13px;cursor:pointer}.snowline-panel.svelte-1tts9re button:focus-visible{outline:2px solid #8de4ff;outline-offset:2px}.status-pill.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:12px;padding:8px}.info-body.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:13px;line-height:1.55}.title.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:15px;white-space:nowrap}.top-row.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{gap:5px}.hide-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{width:30px;height:32px}.switch.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{height:32px;padding:0 5px;font-size:10px}.point-tools.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-top:7px;padding:0;background:none}.point-tools.svelte-1tts9re strong.svelte-1tts9re.svelte-1tts9re{font-size:12px;line-height:1.35;max-height:48px;overflow:auto}.point-tools.svelte-1tts9re>div.svelte-1tts9re.svelte-1tts9re{gap:6px;margin-top:6px}.point-tools.svelte-1tts9re button.svelte-1tts9re.svelte-1tts9re{min-height:36px;font-size:12px}.panel-options.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-top:7px;border-top:1px solid #304655}.panel-options.svelte-1tts9re summary.svelte-1tts9re.svelte-1tts9re{padding:9px 0;cursor:pointer;font-size:11px;color:#a9c4d3}.panel-options.svelte-1tts9re summary.svelte-1tts9re.svelte-1tts9re:focus-visible{outline:2px solid #8de4ff}.hatch-legend.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:10px;margin:6px 0}.help-link.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{background:none;border:0;color:#b3d7e8;font-size:11px;padding:5px 0;text-decoration:underline;cursor:pointer}.status-pill.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:10px;padding:4px}.panel-options.svelte-1tts9re .results{position:static;margin-top:5px;max-height:180px}.panel-options.svelte-1tts9re .search-line input{height:36px;font-size:12px}.panel-options.svelte-1tts9re .utility-row button{height:36px;font-size:11px}.panel-head.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{position:sticky;top:-10px;z-index:3;margin:-10px -10px 0;padding:10px 10px 6px;background:linear-gradient(155deg, #142b3b, #102330);border-bottom:1px solid #304655}@media(max-width: 600px){.panel-head.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{margin-inline:-12px;padding-inline:12px}}.layer-controls.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{gap:6px;margin-top:10px}.layer-controls.svelte-1tts9re label.svelte-1tts9re.svelte-1tts9re{box-sizing:border-box;min-height:34px;padding:6px 8px;border:1px solid #304655;border-radius:7px;background:#152735;color:#afc3ce;font-size:12px}.layer-controls.svelte-1tts9re label.active.svelte-1tts9re.svelte-1tts9re{border-color:#49748a;background:#214153;color:#eefaff}.layer-controls.svelte-1tts9re label.svelte-1tts9re.svelte-1tts9re:focus-within{outline:2px solid #8de4ff;outline-offset:2px}.shade-types.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{grid-template-columns:repeat(2, minmax(0, 1fr));gap:4px 8px;font-size:11px;margin-top:8px}.shade-types.svelte-1tts9re span.svelte-1tts9re.svelte-1tts9re{min-height:22px;white-space:normal;line-height:1.2;gap:6px}.shade-types.svelte-1tts9re svg{width:19px;height:19px;flex:none;filter:drop-shadow(0 0 0.75px #ffffffc0)}.storm-legend.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:10px;line-height:1.5;margin-top:7px}.panel-footer.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{position:sticky;bottom:-10px;z-index:3;background:#102330;border-top:1px solid #304655;padding:6px 0;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:5px}.refresh-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{min-height:34px;padding:0 10px;border:1px solid #446578;border-radius:7px;background:#203a4a;color:#dff5ff;font-size:11px;cursor:pointer}.refresh-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re:disabled{opacity:0.45;cursor:default}.panel-footer.svelte-1tts9re .help-link.svelte-1tts9re.svelte-1tts9re{min-height:34px}.status-pill.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{font-size:11px;min-height:22px}.status-dot.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{flex-shrink:0}@media(prefers-reduced-motion: reduce){.status-dot.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{animation:none}}@media(pointer: coarse){.layer-controls.svelte-1tts9re label.svelte-1tts9re.svelte-1tts9re,.refresh-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re,.panel-footer.svelte-1tts9re .help-link.svelte-1tts9re.svelte-1tts9re{min-height:44px}.hide-button.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re,.switch.svelte-1tts9re.svelte-1tts9re.svelte-1tts9re{min-height:40px}.point-tools.svelte-1tts9re button.svelte-1tts9re.svelte-1tts9re{min-height:44px}.panel-options.svelte-1tts9re summary.svelte-1tts9re.svelte-1tts9re{min-height:24px;padding:10px 0}.panel-options.svelte-1tts9re .utility-row button{height:44px}}");
}

// (3:0) {:else}
function create_else_block(ctx) {
	let div6;
	let div4;
	let div2;
	let div0;
	let t1;
	let div1;
	let button0;
	let t3;
	let label0;
	let input0;
	let span;
	let t4_value = (/*enabled*/ ctx[3] ? 'On' : 'Off') + "";
	let t4;
	let t5;
	let div3;
	let label1;
	let input1;
	let t6;
	let t7;
	let label2;
	let input2;
	let input2_disabled_value;
	let t8;
	let t9;
	let label3;
	let input3;
	let input3_disabled_value;
	let t10;
	let t11;
	let t12;
	let t13;
	let t14;
	let t15;
	let t16;
	let t17;
	let details;
	let summary;

	let t18_value = (/*clickedPoint*/ ctx[18]
	? 'Change place · settings'
	: 'Choose a place') + "";

	let t18;
	let t19;
	let placesearch;
	let t20;
	let v21panel;
	let updating_unitSystem;
	let t21;
	let details_open_value;
	let t22;
	let t23;
	let t24;
	let div5;
	let button1;
	let t25;
	let button1_disabled_value;
	let button2;
	let current;
	let mounted;
	let dispose;
	let if_block0 = !/*precipDetailAvailable*/ ctx[7] && create_if_block_11();
	let if_block1 = /*precipDetailAvailable*/ ctx[7] && (/*showShading*/ ctx[1] || /*showIcons*/ ctx[2]) && create_if_block_10();
	let if_block2 = /*showShading*/ ctx[1] && /*precipDetailAvailable*/ ctx[7] && /*geographyError*/ ctx[13] && create_if_block_9(ctx);
	let if_block3 = (/*showShading*/ ctx[1] || /*showIcons*/ ctx[2]) && /*terrainDetailStatus*/ ctx[11] && create_if_block_8(ctx);
	let if_block4 = /*showIcons*/ ctx[2] && /*precipDetailAvailable*/ ctx[7] && create_if_block_7(ctx);
	let if_block5 = /*clickedPoint*/ ctx[18] && create_if_block_6(ctx);
	placesearch = new PlaceSearch({});
	placesearch.$on("select", /*handlePlaceSelect*/ ctx[24]);
	placesearch.$on("clear", /*handleSearchClear*/ ctx[25]);

	function v21panel_unitSystem_binding(value) {
		/*v21panel_unitSystem_binding*/ ctx[39](value);
	}

	let v21panel_props = { activeRunTime: /*activeRunTime*/ ctx[21] };

	if (/*unitSystem*/ ctx[6] !== void 0) {
		v21panel_props.unitSystem = /*unitSystem*/ ctx[6];
	}

	v21panel = new V21Panel({ props: v21panel_props });
	binding_callbacks.push(() => bind(v21panel, 'unitSystem', v21panel_unitSystem_binding));
	let if_block6 = /*showContours*/ ctx[0] && create_if_block_5();
	let if_block7 = /*refreshError*/ ctx[22] && create_if_block_4(ctx);
	let if_block8 = /*enabled*/ ctx[3] && (/*viewportLoading*/ ctx[16] || /*probeLoading*/ ctx[17] || /*terrainLoading*/ ctx[8] || /*stormLoading*/ ctx[9] || /*rasterLoading*/ ctx[12]) && create_if_block_3(ctx);

	return {
		c() {
			div6 = element("div");
			div4 = element("div");
			div2 = element("div");
			div0 = element("div");
			div0.textContent = "Wintry forecast";
			t1 = space();
			div1 = element("div");
			button0 = element("button");
			button0.textContent = "−";
			t3 = space();
			label0 = element("label");
			input0 = element("input");
			span = element("span");
			t4 = text(t4_value);
			t5 = space();
			div3 = element("div");
			label1 = element("label");
			input1 = element("input");
			t6 = text(" Contours");
			t7 = space();
			label2 = element("label");
			input2 = element("input");
			t8 = text(" Shading");
			t9 = space();
			label3 = element("label");
			input3 = element("input");
			t10 = text(" Icons");
			t11 = space();
			if (if_block0) if_block0.c();
			t12 = space();
			if (if_block1) if_block1.c();
			t13 = space();
			if (if_block2) if_block2.c();
			t14 = space();
			if (if_block3) if_block3.c();
			t15 = space();
			if (if_block4) if_block4.c();
			t16 = space();
			if (if_block5) if_block5.c();
			t17 = space();
			details = element("details");
			summary = element("summary");
			t18 = text(t18_value);
			t19 = space();
			create_component(placesearch.$$.fragment);
			t20 = space();
			create_component(v21panel.$$.fragment);
			t21 = space();
			if (if_block6) if_block6.c();
			t22 = space();
			if (if_block7) if_block7.c();
			t23 = space();
			if (if_block8) if_block8.c();
			t24 = space();
			div5 = element("div");
			button1 = element("button");
			t25 = text("↻ Refresh");
			button2 = element("button");
			button2.textContent = "How it works";
			attr(div0, "class", "title svelte-1tts9re");
			attr(button0, "class", "hide-button svelte-1tts9re");
			attr(button0, "type", "button");
			attr(button0, "aria-label", "Hide Wintry forecast panel");
			attr(button0, "title", "Hide");
			attr(input0, "type", "checkbox");
			attr(input0, "aria-label", "Enable Wintry forecast");
			attr(input0, "class", "svelte-1tts9re");
			attr(label0, "class", "switch svelte-1tts9re");
			attr(div1, "class", "top-controls svelte-1tts9re");
			attr(div2, "class", "top-row svelte-1tts9re");
			attr(input1, "type", "checkbox");
			attr(input1, "class", "svelte-1tts9re");
			attr(label1, "title", "Estimated snowline contours and dry-terrain hatching");
			attr(label1, "class", "svelte-1tts9re");
			toggle_class(label1, "active", /*showContours*/ ctx[0]);
			attr(input2, "type", "checkbox");
			input2.disabled = input2_disabled_value = !/*precipDetailAvailable*/ ctx[7];
			attr(input2, "class", "svelte-1tts9re");
			attr(label2, "title", "Precipitation type colours");
			attr(label2, "class", "svelte-1tts9re");
			toggle_class(label2, "active", /*showShading*/ ctx[1] && /*precipDetailAvailable*/ ctx[7]);
			toggle_class(label2, "unavailable", !/*precipDetailAvailable*/ ctx[7]);
			attr(input3, "type", "checkbox");
			input3.disabled = input3_disabled_value = !/*precipDetailAvailable*/ ctx[7];
			attr(input3, "class", "svelte-1tts9re");
			attr(label3, "title", "Precipitation-type symbols and ECMWF forecast lightning");
			attr(label3, "class", "svelte-1tts9re");
			toggle_class(label3, "active", /*showIcons*/ ctx[2] && /*precipDetailAvailable*/ ctx[7]);
			toggle_class(label3, "unavailable", !/*precipDetailAvailable*/ ctx[7]);
			attr(div3, "class", "layer-controls svelte-1tts9re");
			attr(div3, "role", "group");
			attr(div3, "aria-label", "Map layers");
			attr(div4, "class", "panel-head svelte-1tts9re");
			attr(summary, "class", "svelte-1tts9re");
			attr(details, "class", "panel-options svelte-1tts9re");
			details.open = details_open_value = !/*clickedPoint*/ ctx[18];
			attr(button1, "class", "refresh-button svelte-1tts9re");
			attr(button1, "type", "button");
			button1.disabled = button1_disabled_value = !/*enabled*/ ctx[3] || /*viewportLoading*/ ctx[16] || /*probeLoading*/ ctx[17] || /*terrainLoading*/ ctx[8] || /*stormLoading*/ ctx[9] || /*rasterLoading*/ ctx[12];
			attr(button2, "class", "help-link svelte-1tts9re");
			attr(button2, "type", "button");
			attr(div5, "class", "panel-footer svelte-1tts9re");
			attr(div6, "class", "snowline-panel svelte-1tts9re");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div4);
			append(div4, div2);
			append(div2, div0);
			append(div2, t1);
			append(div2, div1);
			append(div1, button0);
			append(div1, t3);
			append(div1, label0);
			append(label0, input0);
			input0.checked = /*enabled*/ ctx[3];
			append(label0, span);
			append(span, t4);
			append(div4, t5);
			append(div4, div3);
			append(div3, label1);
			append(label1, input1);
			input1.checked = /*showContours*/ ctx[0];
			append(label1, t6);
			append(div3, t7);
			append(div3, label2);
			append(label2, input2);
			input2.checked = /*showShading*/ ctx[1];
			append(label2, t8);
			append(div3, t9);
			append(div3, label3);
			append(label3, input3);
			input3.checked = /*showIcons*/ ctx[2];
			append(label3, t10);
			append(div6, t11);
			if (if_block0) if_block0.m(div6, null);
			append(div6, t12);
			if (if_block1) if_block1.m(div6, null);
			append(div6, t13);
			if (if_block2) if_block2.m(div6, null);
			append(div6, t14);
			if (if_block3) if_block3.m(div6, null);
			append(div6, t15);
			if (if_block4) if_block4.m(div6, null);
			append(div6, t16);
			if (if_block5) if_block5.m(div6, null);
			append(div6, t17);
			append(div6, details);
			append(details, summary);
			append(summary, t18);
			append(details, t19);
			mount_component(placesearch, details, null);
			append(details, t20);
			mount_component(v21panel, details, null);
			append(details, t21);
			if (if_block6) if_block6.m(details, null);
			append(div6, t22);
			if (if_block7) if_block7.m(div6, null);
			append(div6, t23);
			if (if_block8) if_block8.m(div6, null);
			append(div6, t24);
			append(div6, div5);
			append(div5, button1);
			append(button1, t25);
			append(div5, button2);
			current = true;

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[32]),
					listen(input0, "change", /*input0_change_handler*/ ctx[33]),
					listen(input0, "change", /*toggleEnabled*/ ctx[27]),
					listen(input1, "change", /*input1_change_handler*/ ctx[34]),
					listen(input1, "change", /*toggleMapLayers*/ ctx[26]),
					listen(input2, "change", /*input2_change_handler*/ ctx[35]),
					listen(input2, "change", /*toggleMapLayers*/ ctx[26]),
					listen(input3, "change", /*input3_change_handler*/ ctx[36]),
					listen(input3, "change", /*toggleMapLayers*/ ctx[26]),
					listen(button1, "click", /*refreshForecast*/ ctx[23]),
					listen(button2, "click", /*click_handler_4*/ ctx[40])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 8) {
				input0.checked = /*enabled*/ ctx[3];
			}

			if ((!current || dirty[0] & /*enabled*/ 8) && t4_value !== (t4_value = (/*enabled*/ ctx[3] ? 'On' : 'Off') + "")) set_data(t4, t4_value);

			if (dirty[0] & /*showContours*/ 1) {
				input1.checked = /*showContours*/ ctx[0];
			}

			if (!current || dirty[0] & /*showContours*/ 1) {
				toggle_class(label1, "active", /*showContours*/ ctx[0]);
			}

			if (!current || dirty[0] & /*precipDetailAvailable*/ 128 && input2_disabled_value !== (input2_disabled_value = !/*precipDetailAvailable*/ ctx[7])) {
				input2.disabled = input2_disabled_value;
			}

			if (dirty[0] & /*showShading*/ 2) {
				input2.checked = /*showShading*/ ctx[1];
			}

			if (!current || dirty[0] & /*showShading, precipDetailAvailable*/ 130) {
				toggle_class(label2, "active", /*showShading*/ ctx[1] && /*precipDetailAvailable*/ ctx[7]);
			}

			if (!current || dirty[0] & /*precipDetailAvailable*/ 128) {
				toggle_class(label2, "unavailable", !/*precipDetailAvailable*/ ctx[7]);
			}

			if (!current || dirty[0] & /*precipDetailAvailable*/ 128 && input3_disabled_value !== (input3_disabled_value = !/*precipDetailAvailable*/ ctx[7])) {
				input3.disabled = input3_disabled_value;
			}

			if (dirty[0] & /*showIcons*/ 4) {
				input3.checked = /*showIcons*/ ctx[2];
			}

			if (!current || dirty[0] & /*showIcons, precipDetailAvailable*/ 132) {
				toggle_class(label3, "active", /*showIcons*/ ctx[2] && /*precipDetailAvailable*/ ctx[7]);
			}

			if (!current || dirty[0] & /*precipDetailAvailable*/ 128) {
				toggle_class(label3, "unavailable", !/*precipDetailAvailable*/ ctx[7]);
			}

			if (!/*precipDetailAvailable*/ ctx[7]) {
				if (if_block0) ; else {
					if_block0 = create_if_block_11();
					if_block0.c();
					if_block0.m(div6, t12);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*precipDetailAvailable*/ ctx[7] && (/*showShading*/ ctx[1] || /*showIcons*/ ctx[2])) {
				if (if_block1) ; else {
					if_block1 = create_if_block_10();
					if_block1.c();
					if_block1.m(div6, t13);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*showShading*/ ctx[1] && /*precipDetailAvailable*/ ctx[7] && /*geographyError*/ ctx[13]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_9(ctx);
					if_block2.c();
					if_block2.m(div6, t14);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((/*showShading*/ ctx[1] || /*showIcons*/ ctx[2]) && /*terrainDetailStatus*/ ctx[11]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_8(ctx);
					if_block3.c();
					if_block3.m(div6, t15);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (/*showIcons*/ ctx[2] && /*precipDetailAvailable*/ ctx[7]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_7(ctx);
					if_block4.c();
					if_block4.m(div6, t16);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (/*clickedPoint*/ ctx[18]) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_6(ctx);
					if_block5.c();
					if_block5.m(div6, t17);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if ((!current || dirty[0] & /*clickedPoint*/ 262144) && t18_value !== (t18_value = (/*clickedPoint*/ ctx[18]
			? 'Change place · settings'
			: 'Choose a place') + "")) set_data(t18, t18_value);

			const v21panel_changes = {};
			if (dirty[0] & /*activeRunTime*/ 2097152) v21panel_changes.activeRunTime = /*activeRunTime*/ ctx[21];

			if (!updating_unitSystem && dirty[0] & /*unitSystem*/ 64) {
				updating_unitSystem = true;
				v21panel_changes.unitSystem = /*unitSystem*/ ctx[6];
				add_flush_callback(() => updating_unitSystem = false);
			}

			v21panel.$set(v21panel_changes);

			if (/*showContours*/ ctx[0]) {
				if (if_block6) ; else {
					if_block6 = create_if_block_5();
					if_block6.c();
					if_block6.m(details, null);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (!current || dirty[0] & /*clickedPoint*/ 262144 && details_open_value !== (details_open_value = !/*clickedPoint*/ ctx[18])) {
				details.open = details_open_value;
			}

			if (/*refreshError*/ ctx[22]) {
				if (if_block7) {
					if_block7.p(ctx, dirty);
				} else {
					if_block7 = create_if_block_4(ctx);
					if_block7.c();
					if_block7.m(div6, t23);
				}
			} else if (if_block7) {
				if_block7.d(1);
				if_block7 = null;
			}

			if (/*enabled*/ ctx[3] && (/*viewportLoading*/ ctx[16] || /*probeLoading*/ ctx[17] || /*terrainLoading*/ ctx[8] || /*stormLoading*/ ctx[9] || /*rasterLoading*/ ctx[12])) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_3(ctx);
					if_block8.c();
					if_block8.m(div6, t24);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}

			if (!current || dirty[0] & /*enabled, viewportLoading, probeLoading, terrainLoading, stormLoading, rasterLoading*/ 201480 && button1_disabled_value !== (button1_disabled_value = !/*enabled*/ ctx[3] || /*viewportLoading*/ ctx[16] || /*probeLoading*/ ctx[17] || /*terrainLoading*/ ctx[8] || /*stormLoading*/ ctx[9] || /*rasterLoading*/ ctx[12])) {
				button1.disabled = button1_disabled_value;
			}
		},
		i(local) {
			if (current) return;
			transition_in(placesearch.$$.fragment, local);
			transition_in(v21panel.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(placesearch.$$.fragment, local);
			transition_out(v21panel.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(div6);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
			destroy_component(placesearch);
			destroy_component(v21panel);
			if (if_block6) if_block6.d();
			if (if_block7) if_block7.d();
			if (if_block8) if_block8.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (1:0) {#if panelHidden}
function create_if_block_2(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "❄ Wintry forecast";
			attr(button, "class", "show-panel svelte-1tts9re");
			attr(button, "type", "button");
			attr(button, "aria-label", "Show Wintry forecast panel");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[31]);
				mounted = true;
			}
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (20:4) {#if !precipDetailAvailable}
function create_if_block_11(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = "Zoom in to level 8 for shading and icons";
			attr(div, "class", "zoom-hint svelte-1tts9re");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (21:4) {#if precipDetailAvailable && (showShading || showIcons)}
function create_if_block_10(ctx) {
	let div;
	let span0;
	let html_tag;
	let raw0_value = precipitationIconSvg('snow') + "";
	let t0;
	let t1;
	let span1;
	let html_tag_1;
	let raw1_value = precipitationIconSvg('wet-snow') + "";
	let t2;
	let t3;
	let span2;
	let html_tag_2;
	let raw2_value = precipitationIconSvg('mix') + "";
	let t4;
	let t5;
	let span3;
	let html_tag_3;
	let raw3_value = precipitationIconSvg('rain') + "";
	let t6;
	let t7;
	let span4;
	let html_tag_4;
	let raw4_value = precipitationIconSvg('ice-pellets') + "";
	let t8;
	let t9;
	let span5;
	let html_tag_5;
	let raw5_value = precipitationIconSvg('freezing-rain') + "";
	let t10;

	return {
		c() {
			div = element("div");
			span0 = element("span");
			html_tag = new HtmlTag(false);
			t0 = text("Snow");
			t1 = space();
			span1 = element("span");
			html_tag_1 = new HtmlTag(false);
			t2 = text("Wet snow");
			t3 = space();
			span2 = element("span");
			html_tag_2 = new HtmlTag(false);
			t4 = text("Mix");
			t5 = space();
			span3 = element("span");
			html_tag_3 = new HtmlTag(false);
			t6 = text("Rain");
			t7 = space();
			span4 = element("span");
			html_tag_4 = new HtmlTag(false);
			t8 = text("Ice pellets");
			t9 = space();
			span5 = element("span");
			html_tag_5 = new HtmlTag(false);
			t10 = text("Freezing rain");
			html_tag.a = t0;
			attr(span0, "class", "svelte-1tts9re");
			html_tag_1.a = t2;
			attr(span1, "class", "svelte-1tts9re");
			html_tag_2.a = t4;
			attr(span2, "class", "svelte-1tts9re");
			html_tag_3.a = t6;
			attr(span3, "class", "svelte-1tts9re");
			html_tag_4.a = t8;
			attr(span4, "class", "svelte-1tts9re");
			html_tag_5.a = t10;
			attr(span5, "class", "svelte-1tts9re");
			attr(div, "class", "shade-types svelte-1tts9re");
			attr(div, "aria-label", "Precipitation type colours");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span0);
			html_tag.m(raw0_value, span0);
			append(span0, t0);
			append(div, t1);
			append(div, span1);
			html_tag_1.m(raw1_value, span1);
			append(span1, t2);
			append(div, t3);
			append(div, span2);
			html_tag_2.m(raw2_value, span2);
			append(span2, t4);
			append(div, t5);
			append(div, span3);
			html_tag_3.m(raw3_value, span3);
			append(span3, t6);
			append(div, t7);
			append(div, span4);
			html_tag_4.m(raw4_value, span4);
			append(span4, t8);
			append(div, t9);
			append(div, span5);
			html_tag_5.m(raw5_value, span5);
			append(span5, t10);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (31:4) {#if showShading && precipDetailAvailable && geographyError}
function create_if_block_9(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*geographyError*/ ctx[13]);
			attr(div, "class", "storm-legend svelte-1tts9re");
			attr(div, "role", "status");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*geographyError*/ 8192) set_data(t, /*geographyError*/ ctx[13]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (32:4) {#if (showShading || showIcons) && terrainDetailStatus}
function create_if_block_8(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*terrainDetailStatus*/ ctx[11]);
			attr(div, "class", "storm-legend svelte-1tts9re");
			attr(div, "role", "status");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*terrainDetailStatus*/ 2048) set_data(t, /*terrainDetailStatus*/ ctx[11]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (33:4) {#if showIcons && precipDetailAvailable}
function create_if_block_7(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*stormStatus*/ ctx[10]);
			attr(div, "class", "storm-legend svelte-1tts9re");
			attr(div, "role", "status");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*stormStatus*/ 1024) set_data(t, /*stormStatus*/ ctx[10]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (34:4) {#if clickedPoint}
function create_if_block_6(ctx) {
	let div1;
	let strong;
	let t0_value = (/*clickedPlaceName*/ ctx[20] || 'Selected point') + "";
	let t0;
	let div0;
	let button0;
	let button1;
	let mounted;
	let dispose;

	return {
		c() {
			div1 = element("div");
			strong = element("strong");
			t0 = text(t0_value);
			div0 = element("div");
			button0 = element("button");
			button0.textContent = "Forecast";
			button1 = element("button");
			button1.textContent = "Sounding";
			attr(strong, "class", "svelte-1tts9re");
			attr(button0, "type", "button");
			attr(button0, "class", "svelte-1tts9re");
			attr(button1, "type", "button");
			attr(button1, "class", "svelte-1tts9re");
			attr(div0, "class", "svelte-1tts9re");
			attr(div1, "class", "point-tools svelte-1tts9re");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, strong);
			append(strong, t0);
			append(div1, div0);
			append(div0, button0);
			append(div0, button1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_2*/ ctx[37]),
					listen(button1, "click", /*click_handler_3*/ ctx[38])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*clickedPlaceName*/ 1048576 && t0_value !== (t0_value = (/*clickedPlaceName*/ ctx[20] || 'Selected point') + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (41:6) {#if showContours}
function create_if_block_5(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<span class="svelte-1tts9re">╱╱╱</span> Dry terrain above estimated snowline`;
			attr(div, "class", "hatch-legend svelte-1tts9re");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (44:4) {#if refreshError}
function create_if_block_4(ctx) {
	let div;
	let t0;
	let t1;
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			t0 = text(/*refreshError*/ ctx[22]);
			t1 = space();
			button = element("button");
			button.textContent = "Retry";
			attr(button, "type", "button");
			attr(button, "class", "svelte-1tts9re");
			attr(div, "class", "refresh-error svelte-1tts9re");
			attr(div, "role", "status");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
			append(div, button);

			if (!mounted) {
				dispose = listen(button, "click", /*refreshForecast*/ ctx[23]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*refreshError*/ 4194304) set_data(t0, /*refreshError*/ ctx[22]);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			mounted = false;
			dispose();
		}
	};
}

// (46:4) {#if enabled && (viewportLoading || probeLoading || terrainLoading || stormLoading || rasterLoading)}
function create_if_block_3(ctx) {
	let div;
	let span;

	let t_value = (/*probeLoading*/ ctx[17]
	? 'Reading point…'
	: 'Updating…') + "";

	let t;

	return {
		c() {
			div = element("div");
			span = element("span");
			t = text(t_value);
			attr(span, "class", "status-dot svelte-1tts9re");
			attr(div, "class", "status-pill svelte-1tts9re");
			attr(div, "role", "status");
			attr(div, "aria-live", "polite");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*probeLoading*/ 131072 && t_value !== (t_value = (/*probeLoading*/ ctx[17]
			? 'Reading point…'
			: 'Updating…') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (53:0) {#if chartOpen && clickedPoint}
function create_if_block_1(ctx) {
	let snowlinechart;
	let updating_tab;
	let current;

	function snowlinechart_tab_binding(value) {
		/*snowlinechart_tab_binding*/ ctx[41](value);
	}

	let snowlinechart_props = {
		point: /*clickedPoint*/ ctx[18],
		terrainM: /*clickedMapElevationM*/ ctx[19],
		placeName: /*clickedPlaceName*/ ctx[20] || 'Selected point',
		units: /*unitSystem*/ ctx[6]
	};

	if (/*forecastTab*/ ctx[5] !== void 0) {
		snowlinechart_props.tab = /*forecastTab*/ ctx[5];
	}

	snowlinechart = new SnowlineChart({ props: snowlinechart_props });
	binding_callbacks.push(() => bind(snowlinechart, 'tab', snowlinechart_tab_binding));
	snowlinechart.$on("close", /*close_handler*/ ctx[42]);

	return {
		c() {
			create_component(snowlinechart.$$.fragment);
		},
		m(target, anchor) {
			mount_component(snowlinechart, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const snowlinechart_changes = {};
			if (dirty[0] & /*clickedPoint*/ 262144) snowlinechart_changes.point = /*clickedPoint*/ ctx[18];
			if (dirty[0] & /*clickedMapElevationM*/ 524288) snowlinechart_changes.terrainM = /*clickedMapElevationM*/ ctx[19];
			if (dirty[0] & /*clickedPlaceName*/ 1048576) snowlinechart_changes.placeName = /*clickedPlaceName*/ ctx[20] || 'Selected point';
			if (dirty[0] & /*unitSystem*/ 64) snowlinechart_changes.units = /*unitSystem*/ ctx[6];

			if (!updating_tab && dirty[0] & /*forecastTab*/ 32) {
				updating_tab = true;
				snowlinechart_changes.tab = /*forecastTab*/ ctx[5];
				add_flush_callback(() => updating_tab = false);
			}

			snowlinechart.$set(snowlinechart_changes);
		},
		i(local) {
			if (current) return;
			transition_in(snowlinechart.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(snowlinechart.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(snowlinechart, detaching);
		}
	};
}

// (64:0) {#if infoOpen}
function create_if_block(ctx) {
	let div13;
	let div12;
	let div0;
	let b0;
	let t1;
	let button;
	let t3;
	let div11;
	let mounted;
	let dispose;

	return {
		c() {
			div13 = element("div");
			div12 = element("div");
			div0 = element("div");
			b0 = element("b");
			b0.textContent = "How Wintry forecast works";
			t1 = space();
			button = element("button");
			button.textContent = "×";
			t3 = space();
			div11 = element("div");
			div11.innerHTML = `<div class="svelte-1tts9re"><b>Diagonal hatching:</b> sampled map terrain is above the atmospheric snowline estimate. This is not a snowfall forecast; precipitation and the vertical temperature profile determine precipitation type. Hatching appears only where forecast precipitation is zero. Wet or missing precipitation leaves a gap. Small terrain features may be missed between samples.</div> <div class="svelte-1tts9re"><b>Precipitation shading:</b> the forecast legend colours show rain, snow, wet snow, mix, ice pellets and freezing rain. Each precipitation type uses one fixed colour at full opacity above weather and below geographic map details. Intensity shading is removed; numerical amounts remain in point forecasts. The plugin keeps your selected Windy layer and adds its overlays above it. Small raster tiles keep the shading smooth at every zoom. Temperature, dew point, atmospheric height and precipitation are interpolated between available weather samples before diagnosis; categorical colours are never blended. Weather samples target 9 km locally, with bounded overview sampling on broad maps. Cached elevation tiles refine precipitation type with zoom; terrain source detail varies by region. Rainfall amounts retain the sampled ECMWF scale. Coarse interpolated terrain appears while elevation tiles load, and is identified if detailed terrain is unavailable. Missing weather data stays blank. Contours, shading and icons can be hidden independently. The Icons switch controls both precipitation symbols and forecast lightning from zoom 8. Icons use the same terrain-aware type diagnosis as shading, appear only in wet areas, and reuse existing samples.</div> <div class="svelte-1tts9re"><b>Terrain shading source:</b> Mapzen Terrain Tiles, served through the public AWS dataset. <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener noreferrer">Terrain data sources and attribution</a>. Point forecasts retain Windy’s elevation service.</div> <details><summary>Terrain data credits</summary> <p>ArcticDEM: DEMs created from DigitalGlobe imagery; funded by NSF awards 1043681, 1559691 and 1542736. Australia: © Commonwealth of Australia (Geoscience Australia) 2017. Austria: © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich. Canada: contains information licensed under the Open Government Licence – Canada. Europe: produced using Copernicus data and information funded by the European Union, EU-DEM layers. Global ETOPO1: U.S. National Oceanic and Atmospheric Administration. Mexico: INEGI, Continental relief, 2016. New Zealand: Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved). Norway: © Kartverket. United Kingdom: © Environment Agency copyright and/or database right 2015. United States 3DEP and global GMTED2010/SRTM: courtesy of the U.S. Geological Survey.</p></details> <div class="svelte-1tts9re"><b>Lightning symbols:</b> raw ECMWF lightning-density forecast from Windy’s thunder layer, for the selected map time. Symbols indicate areas of forecast lightning activity, not observed or individually predicted strikes. Values below 0.025 in Windy’s native lightning-density units are omitted. Symbol spacing adapts to every map zoom. The raw ECMWF lightning forecast retains its native resolution; symbol placement does not use terrain. Missing data displays no symbols.</div> <div class="svelte-1tts9re"><b>At a glance:</b> precipitation type, terrain, snowline and precipitation for the selected point.</div> <div class="svelte-1tts9re"><b>Next wintry period:</b> timing and estimated new snow through +144 h.</div> <div class="svelte-1tts9re"><b>Forecast intervals:</b> contours update hourly; gaps between available profiles are interpolated. Precipitation is shown as three-hour totals. New snow uses these intervals, precipitation type and an estimated snow-to-water ratio, with simple settling and melt.</div> <div class="svelte-1tts9re"><b>Forecast:</b> snowline, precipitation, precipitation type and estimated new snow on one timeline.</div> <div class="svelte-1tts9re"><b>Sounding:</b> optional vertical detail with hover/touch temperature, dew point and wet bulb.</div> <div class="info-caveat svelte-1tts9re">Estimated new snow is a forecast estimate, not existing snow depth. Valid times use your device timezone; ECMWF cycle labels remain UTC.</div>`;
			attr(button, "type", "button");
			attr(button, "aria-label", "Close information");
			attr(button, "title", "Close");
			attr(button, "class", "svelte-1tts9re");
			attr(div0, "class", "info-head svelte-1tts9re");
			attr(div11, "class", "info-body svelte-1tts9re");
			attr(div12, "class", "info-window svelte-1tts9re");
			attr(div12, "role", "dialog");
			attr(div12, "aria-modal", "true");
			attr(div12, "aria-label", "How Wintry forecast works");
			attr(div13, "class", "info-overlay svelte-1tts9re");
			attr(div13, "role", "presentation");
		},
		m(target, anchor) {
			insert(target, div13, anchor);
			append(div13, div12);
			append(div12, div0);
			append(div0, b0);
			append(div0, t1);
			append(div0, button);
			append(div12, t3);
			append(div12, div11);

			if (!mounted) {
				dispose = [
					listen(button, "click", /*click_handler_5*/ ctx[43]),
					listen(div13, "click", self(/*click_handler_6*/ ctx[44]))
				];

				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div13);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$1(ctx) {
	let current_block_type_index;
	let if_block0;
	let t0;
	let t1;
	let if_block2_anchor;
	let current;
	const if_block_creators = [create_if_block_2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*panelHidden*/ ctx[4]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let if_block1 = /*chartOpen*/ ctx[15] && /*clickedPoint*/ ctx[18] && create_if_block_1(ctx);
	let if_block2 = /*infoOpen*/ ctx[14] && create_if_block(ctx);

	return {
		c() {
			if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, t0, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, t1, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, if_block2_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block0 = if_blocks[current_block_type_index];

				if (!if_block0) {
					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block0.c();
				} else {
					if_block0.p(ctx, dirty);
				}

				transition_in(if_block0, 1);
				if_block0.m(t0.parentNode, t0);
			}

			if (/*chartOpen*/ ctx[15] && /*clickedPoint*/ ctx[18]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*chartOpen, clickedPoint*/ 294912) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(t1.parentNode, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*infoOpen*/ ctx[14]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
				detach(if_block2_anchor);
			}

			if_blocks[current_block_type_index].d(detaching);
			if (if_block1) if_block1.d(detaching);
			if (if_block2) if_block2.d(detaching);
		}
	};
}

const MODEL = 'ecmwf';

const MAX_CONCURRENT = 12,
	CONTOUR_STEP_H = 1,
	FORECAST_DAYS = 6,
	MAX_FORECAST_HOURS = 144,
	PROFILE_CACHE_MAX = 1600,
	MIN_VALID_FRACTION = 0.32,
	POSITION_NEAR_SNOWLINE_METRES = 100,
	TENDENCY_HOURS = 1;

const FAVOURITES_STORAGE_KEY = 'snowline:favourites:v1',
	FAVOURITES_CHANGED_EVENT = 'wintry:favourites-changed',
	PREFS_STORAGE_KEY = 'wintry:prefs:v1';

const PRECIP_PANE = 'wintry-precip-shading';

function hexToRgb(hex) {
	const v = hex.replace('#', '');

	return [
		parseInt(v.slice(0, 2), 16),
		parseInt(v.slice(2, 4), 16),
		parseInt(v.slice(4, 6), 16)
	];
}

function rgbToHex(r, g, b) {
	const p = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
	return `#${p(r)}${p(g)}${p(b)}`;
}

function parseTime(v) {
	if (typeof v === 'number' && Number.isFinite(v)) return v > 1e12 ? v : v > 1e9 ? v * 1000 : null;

	if (typeof v === 'string') {
		const p = Date.parse(v);
		if (Number.isFinite(p)) return p;
	}

	return null;
}

function scalarNumber(v) {
	if (typeof v === 'number' && Number.isFinite(v)) return v;

	if (typeof v === 'string' && v.trim() !== '') {
		const p = Number(v);
		if (Number.isFinite(p)) return p;
	}

	return null;
}

function nearestIndex(times, target) {
	let best = 0, d = Infinity;

	times.forEach((t, i) => {
		const x = Math.abs(t - target);

		if (x < d) {
			d = x;
			best = i;
		}
	});

	return best;
}

function extractPayload(payload) {
	const r = payload;

	return {
		forecast: r?.data?.data && typeof r.data.data === 'object'
		? r.data.data
		: {},
		header: r?.data?.header && typeof r.data.header === 'object'
		? r.data.header
		: {}
	};
}

function profileKey(lat, lon, step) {
	return `${step}:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

async function mapLimit(items, limit, fn) {
	const out = new Array(items.length);
	let next = 0;

	async function worker() {
		while (true) {
			const i = next++;
			if (i >= items.length) return;
			out[i] = await fn(items[i]);
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}

function statusColor(s) {
	return s === 'above'
	? '#46d9ff'
	: s === 'below'
		? '#ff9d3d'
		: s === 'near' ? '#ffe45c' : '#fff';
}

function statusForDifference(d) {
	return d > POSITION_NEAR_SNOWLINE_METRES
	? 'above'
	: d < -POSITION_NEAR_SNOWLINE_METRES ? 'below' : 'near';
}

function shortValid(t) {
	return new Date(t).toLocaleString(undefined, {
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatCoordinate(lat, lon) {
	return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
}

function formatLocal(t) {
	return new Date(t).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'short'
	});
}

function escapeLabelText(value) {
	return value.replace(/[&<>"']/g, c => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[c]);
}

async function copyText(text) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}

	const t = document.createElement('textarea');
	t.value = text;
	t.style.position = 'fixed';
	t.style.opacity = '0';
	document.body.appendChild(t);
	t.focus();
	t.select();
	const copied = document.execCommand('copy');
	t.remove();
	if (!copied) throw new Error('Copy failed');
}

function favouriteKey(lat, lon) {
	return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

function readFavourites() {
	try {
		const raw = localStorage.getItem(FAVOURITES_STORAGE_KEY),
			p = raw ? JSON.parse(raw) : [];

		return Array.isArray(p) ? p : [];
	} catch {
		return [];
	}
}

function metricTile(label, value, className = '') {
	return `<span class="${className}"><small>${label}</small><strong>${value}</strong></span>`;
}

function instance$1($$self, $$props, $$invalidate) {
	let showContours = true, showShading = true, showIcons = true;
	let precipDetailAvailable = Number(map.getZoom()) >= PRECIP_DETAIL_MIN_ZOOM;
	let terrainLoading = false, stormLoading = false;
	let stormInterpolator = null;

	let stormLayer = null,
		stormAbort = null,
		stormKey = '',
		stormEpoch = 0,
		stormStatus = '⚡ ECMWF forecast lightning';

	let shadingLayer = null, precipIconLayer = null;
	const terrainTiles = new TerrainTiles();

	let terrainDetailStatus = '',
		rasterEpoch = 0,
		rasterTimer = null;

	let terrainGeneration = 0, terrainJobKey = '';
	const frameCache = new Map();
	const stormFrames = new Map();
	const FRAME_PIXEL_BUDGET = 48 * 1024 * 1024;

	let activePhaseKey = '',
		pendingPhaseKey = '',
		weatherRevision = 0,
		terrainRevision = 0,
		rasterLoading = false;

	let prefetchTimer = null, prefetchBusy = false;
	const GEOGRAPHY_ID = `wintry-geography-${Date.now()}`;
	let geographyLayer = null, geographyEpoch = 0, geographyError = '';
	const geographicTiles = new GeographicTiles();
	let nativeMap = null;

	let enabled = true,
		panelHidden = false,
		infoOpen = false,
		chartOpen = false,
		forecastTab = 'graph',
		viewportLoading = false,
		refreshQueued = false,
		probeLoading = false,
		unitSystem = 'metric',
		prefsReady = false;

	let cache = [],
		contourLayer = null,
		clickLayer = null,
		clickedPoint = null,
		clickedLatLon = null,
		clickedMapElevationM = null,
		clickedPlaceName = null,
		pointSource = null,
		clickedNextEventTime = null;

	let moveTimer = null,
		generation = 0,
		clickGeneration = 0,
		timestampListener = null,
		activeRunTime = null,
		renderedUnitSystem = null;

	const profileCache = new Map();
	const pendingProfiles = new Map();
	const forecastRequests = new Set();
	let refreshEpoch = 0, lastChecked = null, refreshError = '', destroyed = false;
	let placeAbort = null;
	let freshnessTimer = null;
	let lastRefreshAttempt = Date.now();

	const COLOUR_STOPS = [
		{ value: -500, color: '#b04de8' },
		{ value: 500, color: '#4b3fbf' },
		{ value: 1500, color: '#2196f3' },
		{ value: 2500, color: '#32c75a' },
		{ value: 3500, color: '#ffeb3b' },
		{ value: 4500, color: '#ff9800' },
		{ value: 6000, color: '#f44336' }
	];

	function contourIntervalForZoom() {
		const z = Number(map.getZoom?.() ?? 6);
		return z <= 4 ? 500 : z <= 7 ? 200 : 100;
	}

	function colorForLevel(level) {
		if (level <= COLOUR_STOPS[0].value) return COLOUR_STOPS[0].color;
		if (level >= COLOUR_STOPS.at(-1).value) return COLOUR_STOPS.at(-1).color;

		for (let i = 0; i < COLOUR_STOPS.length - 1; i++) {
			const a = COLOUR_STOPS[i], b = COLOUR_STOPS[i + 1];
			if (level < a.value || level > b.value) continue;

			const f = (level - a.value) / (b.value - a.value),
				x = hexToRgb(a.color),
				y = hexToRgb(b.color);

			return rgbToHex(x[0] + (y[0] - x[0]) * f, x[1] + (y[1] - x[1]) * f, x[2] + (y[2] - x[2]) * f);
		}

		return '#fff';
	}

	function getStoreTimestamp() {
		try {
			const t = store.get('timestamp');
			if (typeof t === 'number' && Number.isFinite(t)) return t;
		} catch {
			
		}

		return Date.now();
	}

	async function fetchMapElevation(lat, lon) {
		const abort = new AbortController();
		forecastRequests.add(abort);
		const timer = setTimeout(() => abort.abort(), 15_000);

		try {
			const r = await getElevation(lat, wrappedLongitude(lon), { abortSignal: abort.signal });

			for (const c of [r?.data, r?.data?.data, r?.value]) {
				const e = scalarNumber(c);
				if (e !== null) return e;
			}
		} catch(e) {
			if (!abort.signal.aborted) console.warn('Wintry forecast map elevation failed', lat, lon, e);
		} finally {
			clearTimeout(timer);
			forecastRequests.delete(abort);
		}

		return null;
	}

	function invalidateForNewRun(run) {
		if (run === null || isOlderRun(run, activeRunTime)) return;

		if (activeRunTime === null) {
			$$invalidate(21, activeRunTime = run);
			return;
		}

		if (run > activeRunTime + 60_000) {
			$$invalidate(21, activeRunTime = run);
			profileCache.clear();
			stormFrames.clear();
			clearStorms();
			cache = [];
			clearContours();
			clearShading();
		}
	}

	const elevationCache = new Map();
	const readyElevations = new Map();

	function loadMapElevation(lat, lon) {
		const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
		const cached = elevationCache.get(key);
		if (cached) return cached;

		const request = fetchMapElevation(lat, lon).then(value => {
			if (value === null) elevationCache.delete(key); else {
				readyElevations.delete(key);
				readyElevations.set(key, value);
				while (readyElevations.size > 4096) readyElevations.delete(readyElevations.keys().next().value);
			}

			return value;
		});

		elevationCache.set(key, request);
		while (elevationCache.size > PROFILE_CACHE_MAX) elevationCache.delete(elevationCache.keys().next().value);
		return request;
	}

	function rememberProfile(p) {
		const k = profileKey(p.lat, p.lon, p.step);
		profileCache.delete(k);
		profileCache.set(k, p);

		while (profileCache.size > PROFILE_CACHE_MAX) {
			const o = profileCache.keys().next().value;
			if (o === undefined) break;
			profileCache.delete(o);
		}
	}

	function cachedProfile(lat, lon, step) {
		const k = profileKey(lat, lon, step), p = profileCache.get(k);
		if (!p) return null;

		if (!profileIsFresh(p.fetchedAt, p.runTime, activeRunTime)) {
			profileCache.delete(k);
			return null;
		}

		profileCache.delete(k);
		profileCache.set(k, p);
		return p;
	}

	async function loadPoint(lat, lon, step = 1) {
		const c = cachedProfile(lat, lon, step);

		if (c) {
			if (c.terrainM === null) c.terrainM = await loadMapElevation(lat, lon);
			return c;
		}

		const key = profileKey(lat, lon, step),
			epoch = refreshEpoch,
			pending = pendingProfiles.get(key);

		if (pending) return pending;

		const request = (async () => {
			const abort = new AbortController();
			forecastRequests.add(abort);
			const timer = setTimeout(() => abort.abort(), 20_000);

			try {
				const [r, terrainM] = await Promise.all([
					getMeteogramForecastData(MODEL, { lat, lon: wrappedLongitude(lon), step }, undefined, { abortSignal: abort.signal }),
					loadMapElevation(lat, lon)
				]);

				if (destroyed || epoch !== refreshEpoch) return null;
				const { forecast, header } = extractPayload(r);
				if (!Object.keys(forecast).length) return null;
				const runTime = parseTime(header.refTime);
				if (isOlderRun(runTime, activeRunTime)) return null;
				invalidateForNewRun(runTime);

				const p = {
					lat,
					lon,
					forecast,
					header,
					times: buildForecastTimes(forecast, runTime),
					runTime,
					step,
					terrainM,
					fetchedAt: Date.now()
				};

				if (!p.times.length) return null;
				rememberProfile(p);
				return p;
			} catch(e) {
				if (!abort.signal.aborted) console.warn('Wintry forecast point request failed', lat, lon, e);
				return null;
			} finally {
				clearTimeout(timer);
				forecastRequests.delete(abort);
			}
		})();

		pendingProfiles.set(key, request);

		try {
			return await request;
		} finally {
			if (pendingProfiles.get(key) === request) pendingProfiles.delete(key);
		}
	}

	function currentBounds() {
		const b = map.getBounds();

		return {
			south: Math.max(-85, b.getSouth()),
			north: Math.min(85, b.getNorth()),
			west: b.getWest(),
			east: b.getEast()
		};
	}

	function buildViewportPoints() {
		const grid = viewportWeatherGrid(currentBounds(), Number(map.getZoom?.() ?? 6));
		const mid = map.getCenter();
		grid.points.sort((a, b) => (a.lat - mid.lat) ** 2 + (a.lon - mid.lng) ** 2 - ((b.lat - mid.lat) ** 2 + (b.lon - mid.lng) ** 2));
		return grid;
	}

	async function refreshViewport() {
		if (!enabled || destroyed || !showContours && (!precipDetailAvailable || !showShading && !showIcons)) return;

		if (viewportLoading) {
			refreshQueued = true;
			return;
		}

		refreshQueued = false;
		const my = ++generation;
		$$invalidate(16, viewportLoading = true);
		const { points, rows, cols } = buildViewportPoints();
		const progressive = Array.from({ length: rows }, () => Array(cols).fill(null));
		let completed = 0, paintedAt = 0;

		try {
			const results = await mapLimit(points, MAX_CONCURRENT, async p => {
				const result = my === generation && enabled && !destroyed
				? await loadPoint(p.lat, p.lon, CONTOUR_STEP_H)
				: null;

				if (result && !result.precipChecked && my === generation) {
					result.precipChecked = true;

					if (!result.times.some((_, i) => precipMmAt(result.forecast, i) !== null)) {
						const fields = await loadSelectedPrecipFields(p.lat, wrappedLongitude(p.lon), FORECAST_DAYS);

						if (my === generation && profileIsFresh(result.fetchedAt, result.runTime, activeRunTime)) {
							Object.assign(result.forecast, alignSelectedPrecipFields(fields, result.times, result.runTime));
						}
					}
				}

				if (my === generation && result && profileIsFresh(result.fetchedAt, result.runTime, activeRunTime)) {
					progressive[p.r][p.c] = result;
					completed++;

					if (completed >= 12 && Date.now() - paintedAt > 700) {
						cache = progressive;
						weatherRevision++;
						frameCache.clear();
						paintedAt = Date.now();
						renderFromCache();
					}
				}

				return { ...p, result };
			});

			if (my !== generation || !enabled || destroyed) return;
			const sameRun = p => p && profileIsFresh(p.fetchedAt, p.runTime, activeRunTime);
			const valid = results.filter(x => x.result?.times.length && sameRun(x.result)).length;

			if (valid < Math.max(4, Math.floor(points.length * MIN_VALID_FRACTION))) {
				cache = [];
				clearContours();
				clearShading();
				$$invalidate(22, refreshError = 'Map forecast unavailable.');
				return;
			}

			const next = Array.from({ length: rows }, () => Array(cols).fill(null));
			for (const x of results) if (sameRun(x.result)) next[x.r][x.c] = x.result;
			cache = next;
			weatherRevision++;
			frameCache.clear();
			lastChecked = Date.now();
			$$invalidate(22, refreshError = '');
			renderFromCache();
			if (clickedPoint && clickedLatLon && !profileIsFresh(clickedPoint.fetchedAt, clickedPoint.runTime, activeRunTime)) void probeLocation(...clickedLatLon, pointSource ?? 'map-click', clickedPlaceName);
		} finally {
			if (my === generation) $$invalidate(16, viewportLoading = false);

			if (refreshQueued && enabled && !destroyed) {
				refreshQueued = false;
				setTimeout(refreshViewport, 0);
			}
		}
	}

	function checkAutomaticRefresh() {
		if (!destroyed && automaticRefreshDue({
			enabled,
			busy: viewportLoading || probeLoading,
			hidden: document.hidden,
			online: navigator.onLine,
			failed: !!refreshError || lastChecked === null,
			lastAttempt: lastRefreshAttempt
		})) refreshForecast();
	}

	function refreshForecast() {
		if (!enabled || destroyed) return;
		lastRefreshAttempt = Date.now();
		stormFrames.clear();
		clearStorms();
		void renderStorms();
		terrainTiles.retry();
		terrainJobKey = '';
		refreshEpoch++;
		generation++;
		$$invalidate(16, viewportLoading = false);
		refreshQueued = false;
		profileCache.clear();
		pendingProfiles.clear();
		$$invalidate(22, refreshError = '');
		if (clickedLatLon) void probeLocation(...clickedLatLon, pointSource ?? 'map-click', clickedPlaceName);
		void refreshViewport();
	}

	function clearContours() {
		if (!contourLayer) return;

		try {
			map.removeLayer(contourLayer);
		} catch {
			
		}

		contourLayer = null;
	}

	function clearPrecipIcons() {
		if (precipIconLayer) try {
			map.removeLayer(precipIconLayer);
		} catch {
			
		}

		precipIconLayer = null;
		activePhaseKey = '';
	}

	function clearShading() {
		frameCache.clear();
		activePhaseKey = '';
		pendingPhaseKey = '';
		$$invalidate(12, rasterLoading = false);

		if (prefetchTimer) {
			clearTimeout(prefetchTimer);
			prefetchTimer = null;
		}

		clearGeography();
		$$invalidate(8, terrainLoading = false);
		$$invalidate(11, terrainDetailStatus = '');
		rasterEpoch++;

		if (rasterTimer) {
			clearTimeout(rasterTimer);
			rasterTimer = null;
		}

		clearPrecipIcons();
		terrainGeneration++;
		terrainJobKey = '';
		if (!shadingLayer) return;

		try {
			map.removeLayer(shadingLayer);
		} catch {
			
		}

		shadingLayer = null;
	}

	function clearGeography() {
		geographyEpoch++;
		$$invalidate(13, geographyError = '');

		if (geographyLayer) try {
			map.removeLayer(geographyLayer);
		} catch {
			
		}

		geographyLayer = null;
	}

	async function renderGeography(frame, key, masks, z) {
		const epoch = geographyEpoch, next = L.layerGroup();
		let failed = false;

		const tiles = typeof getMapTiles === 'function' ? getMapTiles() : {},
			kind = String(store.get('map') ?? document.body.dataset.map ?? 'sznmap');

		const template = Math.floor(Number(map.getZoom())) <= 11
		? tiles.graymap
		: tiles[kind] ?? tiles.sznmap;

		const urlTemplate = template ?? 'https://tiles.windy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}/?lang=en';
		const pane = map.getPane(GEOGRAPHY_ID) || map.createPane(GEOGRAPHY_ID);
		pane.style.zIndex = '395';
		pane.style.pointerEvents = 'none';
		const current = () => epoch === geographyEpoch && !destroyed && (frameCache.get(key) === frame || activePhaseKey === key);

		await mapLimit(masks, 4, async m => {
			if (!current()) return;

			try {
				const n = 2 ** z,
					url = urlTemplate.replace('{z}', String(z)).replace('{x}', String((m.tile.x % n + n) % n)).replace('{y}', String(m.tile.y));

				const image = await geographicTiles.get(url);
				if (!current()) return;
				const canvas = document.createElement('canvas');
				canvas.width = TILE_SIZE;
				canvas.height = TILE_SIZE;
				const ctx = canvas.getContext('2d');
				if (!ctx) return;
				ctx.drawImage(image, 0, 0, TILE_SIZE, TILE_SIZE);
				ctx.globalCompositeOperation = 'destination-in';
				ctx.drawImage(m.canvas, 0, 0);

				L.imageOverlay(canvas.toDataURL('image/png'), [[m.se.lat, m.nw.lon], [m.nw.lat, m.se.lon]], {
					pane: GEOGRAPHY_ID,
					opacity: .45,
					interactive: false,
					className: 'wintry-geographic-tile'
				}).addTo(next);
			} catch {
				failed = true;
			}
		});

		if (!current()) {
			next.clearLayers();
			return;
		}

		frame.geography = next;
		frame.geographyError = failed ? 'Some map detail tiles unavailable' : '';

		if (activePhaseKey === key) {
			next.addTo(map);
			const old = geographyLayer;
			geographyLayer = next;

			if (old && old !== next) try {
				map.removeLayer(old);
			} catch {
				
			}

			$$invalidate(13, geographyError = frame.geographyError);
		}
	}

	function clearClickLayer() {
		if (!clickLayer) return;

		try {
			map.removeLayer(clickLayer);
		} catch {
			
		}

		clickLayer = null;
	}

	function clearPointState(closeChart = true) {
		placeAbort?.abort();
		placeAbort = null;
		clickGeneration++;
		$$invalidate(17, probeLoading = false);
		if (closeChart) $$invalidate(15, chartOpen = false);
		$$invalidate(18, clickedPoint = null);
		clickedLatLon = null;
		$$invalidate(19, clickedMapElevationM = null);
		$$invalidate(20, clickedPlaceName = null);
		pointSource = null;
		clickedNextEventTime = null;
		clearClickLayer();
	}

	function positionText(d) {
		const a = Math.abs(d);
		if (a <= POSITION_NEAR_SNOWLINE_METRES) return `<strong>Near snowline</strong><small>within ±${formatElevation(POSITION_NEAR_SNOWLINE_METRES, unitSystem)}</small>`;

		const side = d > 0 ? 'above' : 'below',
			label = a > 1000
			? `Far ${side} snowline`
			: a > 300
				? `Well ${side} snowline`
				: `Slightly ${side} snowline`;

		return `<strong>${label}</strong><small>${formatElevation(a, unitSystem)} ${side}</small>`;
	}

	function snowlineAt(point, index) {
		const r = wetBulbZeroHeight(buildProfile(point.forecast, index));

		return r.snowLevelM !== null && Number.isFinite(r.snowLevelM)
		? r.snowLevelM
		: null;
	}

	function tendencyText(point, index) {
		const now = snowlineAt(point, index);
		if (now === null) return '';
		const target = point.times[index] + TENDENCY_HOURS * 3600_000;
		if (target > point.times.at(-1) + 30 * 60_000) return '';
		const fi = nearestIndex(point.times, target);
		if (fi === index) return '';
		const future = snowlineAt(point, fi);
		if (future === null) return '';
		const d = Math.round((future - now) / ((point.times[fi] - point.times[index]) / 3600_000) / 10) * 10;

		return Math.abs(d) < 20
		? '→ Steady'
		: `${d > 0 ? '↑' : '↓'} ${formatElevation(Math.abs(d), unitSystem)}/h`;
	}

	function phaseAt(point, index, terrainM) {
		const precip = precipMmAt(point.forecast, index);
		if (precip === null || precip < PRECIP_THRESHOLD_MM_H) return null;
		return terrainPrecipitationType(buildProfile(point.forecast, index), terrainM);
	}

	async function resolvePlaceName(lat, lon, signal) {
		if (clickedPlaceName) return clickedPlaceName;

		try {
			const d = await geocode(
					'reverse',
					new URLSearchParams({
							format: 'jsonv2',
							zoom: '12',
							lat: String(lat),
							lon: String(lon)
						}),
					signal
				),
				a = d?.address ?? {};

			const local = d?.name || a.city || a.town || a.village || a.municipality || a.county,
				country = a.country;

			if (local && country) return String(local) + ', ' + String(country);
			if (local) return String(local);
		} catch {
			
		}

		return formatCoordinate(lat, lon);
	}

	async function updatePointPlaceName(lat, lon, selection) {
		placeAbort?.abort();
		const abort = new AbortController();
		placeAbort = abort;
		const timer = setTimeout(() => abort.abort(), 5000);

		try {
			const name = await resolvePlaceName(lat, lon, abort.signal);
			if (selection !== clickGeneration || destroyed || !enabled) return;
			$$invalidate(20, clickedPlaceName = name);

			if (clickedPoint) updatePersistentClickLabel(); else {
				const title = document.querySelector('.snowline-point-place');
				if (title) title.textContent = name;
			}
		} finally {
			clearTimeout(timer);
			if (placeAbort === abort) placeAbort = null;
		}
	}

	function isCurrentFavourite() {
		if (!clickedLatLon) return false;
		const k = favouriteKey(...clickedLatLon);
		return readFavourites().some(i => Number.isFinite(Number(i?.lat)) && Number.isFinite(Number(i?.lon)) && favouriteKey(Number(i.lat), Number(i.lon)) === k);
	}

	async function toggleCurrentFavourite(button) {
		if (!clickedLatLon) return;
		const [lat, lon] = clickedLatLon, k = favouriteKey(lat, lon);
		let items = readFavourites();
		const exists = items.some(i => Number.isFinite(Number(i?.lat)) && Number.isFinite(Number(i?.lon)) && favouriteKey(Number(i.lat), Number(i.lon)) === k);

		if (exists) items = items.filter(i => !(Number.isFinite(Number(i?.lat)) && Number.isFinite(Number(i?.lon)) && favouriteKey(Number(i.lat), Number(i.lon)) === k)); else {
			const name = await resolvePlaceName(lat, lon),
				parts = name.split(',').map(v => v.trim()).filter(Boolean);

			items = [
				{
					lat,
					lon,
					primary: parts[0] || 'Saved point',
					secondary: parts.slice(1).join(', ')
				},
				...items
			].slice(0, 30);
		}

		try {
			localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(items));
		} catch {
			
		}

		window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGED_EVENT));
		button.textContent = exists ? 'Save' : 'Saved';
		button.classList.toggle('saved', !exists);
		button.title = exists ? 'Save location' : 'Remove saved location';
		button.setAttribute('aria-label', button.title);
	}

	async function shareCurrentPoint(button) {
		if (!clickedPoint || !clickedLatLon || !clickedPoint.times.length) return;

		const point = clickedPoint,
			[lat, lon] = clickedLatLon,
			target = getStoreTimestamp(),
			index = forecastIntervalIndex(point.times, target);

		if (index < 0) return;

		const terrain = clickedMapElevationM,
			units = unitSystem,
			place = clickedPlaceName || formatCoordinate(lat, lon),
			validTime = point.times[index];

		const snowline = snowlineAt(point, index),
			precip = precipMmAt(point.forecast, index),
			phase = terrain !== null ? phaseAt(point, index, terrain) : null;

		const event = terrain !== null
		? nextWintryEvent(point, terrain, target)
		: null;

		const text = [
			'Wintry forecast',
			place,
			'Valid: ' + formatLocal(validTime),
			conditionLabel(precip, phase),
			'Snowline: ' + formatElevation(snowline, units),
			'Terrain: ' + formatElevation(terrain, units),
			'Precipitation: ' + formatPrecip(precip, units),
			event
			? (event.activeNow ? 'Current' : 'Next') + ' wintry period: ' + formatLocal(event.startTime) + ' to ' + formatLocal(event.endTime)
			: noEventMessage(point, terrain, target),
			event
			? event.incomplete
				? 'Snow amount uncertain'
				: 'Estimated new snow' + (event.activeNow ? ' remaining' : '') + ': ' + formatSnow(event.newSnowCm, units)
			: '',
			'ECMWF atmospheric profile · Windy terrain. Snow amounts are estimates.'
		].filter(Boolean).join('\n');

		button.disabled = true;

		try {
			await copyText(text);
			button.textContent = 'Copied';
		} catch {
			button.textContent = 'Retry';
		} finally {
			button.disabled = false;

			setTimeout(
				() => {
					if (button.isConnected) button.textContent = 'Copy';
				},
				1600
			);
		}
	}

	function compactEventSummary(point, terrainM, target) {
		const event = nextWintryEvent(point, terrainM, target);

		if (!event) return {
			text: noEventMessage(point, terrainM, target),
			jumpTime: null
		};

		const amount = event.incomplete
		? ' · amount uncertain'
		: event.newSnowCm > 0.05
			? ' · est. ' + formatSnow(event.newSnowCm, unitSystem) + (event.activeNow ? ' remaining' : '')
			: '';

		if (event.activeNow) return {
			text: precipitationLabel(event.dominantPhase, event.confidence) + ' until ' + shortValid(event.endTime) + amount,
			jumpTime: null
		};

		return {
			text: precipitationLabel(event.dominantPhase, event.confidence) + ' · ' + shortValid(event.startTime) + amount,
			jumpTime: event.startTime
		};
	}

	function labelGrid(args) {
		const terrain = metricTile('Terrain', formatElevation(args.terrain, unitSystem), 'metric-terrain');
		const snowline = metricTile('Snowline', formatElevation(args.snowline, unitSystem), 'metric-snowline');

		const relation = `<div class="snowline-compact-relation">${positionText(args.difference)}<span>${args.precip === null
		? 'Precip unavailable'
		: args.hasPrecip
			? `Precip ${formatPrecip(args.precip, unitSystem)}`
			: 'Dry'}</span></div>`;

		const grid = `<div class="snowline-label-grid">${terrain}${snowline}</div>`;

		const summary = args.canJump
		? `<button class="snowline-event-line snowline-event-jump" type="button" title="Jump to next wintry period" aria-label="Jump to next wintry period">${args.eventLine}<span>›</span></button>`
		: `<div class="snowline-event-line">${args.eventLine}</div>`;

		return `<div class="snowline-valid">${args.valid}</div>${grid}${relation}${summary}`;
	}

	function showClickLabel(
		lat,
	lon,
	mainText,
	detailHtml = '',
	snowlineColor = '#fff',
	status = 'neutral',
	phaseKey = null
	) {
		clearClickLayer();
		clickLayer = L.layerGroup().addTo(map);

		const accent = phaseKey
		? PRECIP_TYPE_COLOURS[phaseKey] ?? statusColor(status)
		: statusColor(status);

		L.marker([lat, lon], {
			interactive: false,
			keyboard: false,
			zIndexOffset: 2100,
			icon: L.divIcon({
				className: 'wintry-point-pointer',
				html: `<span style="--probe-accent:${accent}"></span>`,
				iconSize: [14, 14],
				iconAnchor: [7, 7]
			})
		}).addTo(clickLayer);

		const detail = detailHtml
			? `<div class="snowline-label-detail">${detailHtml}</div>`
			: '',
			saved = isCurrentFavourite(),
			actions = clickedPoint && clickedLatLon
			? `<button class="snowline-label-chart" type="button" aria-label="Open forecast" title="Open forecast">Forecast</button><button class="snowline-label-favourite${saved ? ' saved' : ''}" type="button" aria-label="${saved ? 'Remove saved location' : 'Save location'}" title="${saved ? 'Remove saved location' : 'Save location'}">${saved ? 'Saved' : 'Save'}</button><button class="snowline-label-share" type="button" aria-label="Copy Wintry forecast details" title="Copy Wintry forecast details">Copy</button>`
			: '',
			dry = mainText === 'DRY';

		const marker = L.marker([lat, lon], {
			interactive: true,
			bubblingMouseEvents: false,
			zIndexOffset: 2000,
			icon: L.divIcon({
				className: `snowline-click-label snowline-probe-${status}${dry ? ' snowline-card-dry' : ''}`,
				html: `<span style="--snowline-color:${snowlineColor};--probe-accent:${accent}">${actions}<button class="snowline-label-close" type="button" aria-label="Close Wintry forecast label" title="Close">×</button><div class="snowline-point-place">${escapeLabelText(clickedPlaceName || formatCoordinate(lat, lon))}</div><b>${mainText}</b>${detail}</span>`,
				iconSize: [0, 0],
				iconAnchor: [0, 0]
			})
		}).addTo(clickLayer);

		marker.on('click', event => {
			const original = event?.originalEvent,
				target = original?.target,
				graph = target?.closest?.('.snowline-label-chart'),
				jump = target?.closest?.('.snowline-event-jump'),
				fav = target?.closest?.('.snowline-label-favourite'),
				share = target?.closest?.('.snowline-label-share'),
				close = target?.closest?.('.snowline-label-close');

			if (!graph && !jump && !fav && !share && !close) return;

			try {
				L.DomEvent.stop(original);
			} catch {
				
			}

			if (graph) {
				if (clickedPoint) {
					$$invalidate(5, forecastTab = 'graph');
					$$invalidate(15, chartOpen = true);
				}

				return;
			}

			if (jump && clickedNextEventTime !== null) {
				try {
					store.set('timestamp', clickedNextEventTime);
				} catch {
					
				}

				$$invalidate(5, forecastTab = 'graph');
				$$invalidate(15, chartOpen = true);
				return;
			}

			if (fav) {
				void toggleCurrentFavourite(fav);
				return;
			}

			if (share) {
				void shareCurrentPoint(share);
				return;
			}

			clearPointState(true);
		});
	}

	function updatePersistentClickLabel() {
		if (!enabled) {
			clearClickLayer();
			return;
		}

		if (!clickedPoint || !clickedLatLon || !clickedPoint.times.length) return;
		clickedNextEventTime = null;

		const [lat, lon] = clickedLatLon,
			target = getStoreTimestamp(),
			first = clickedPoint.times[0],
			end = Math.min(clickedPoint.times.at(-1), first + MAX_FORECAST_HOURS * 3600_000);

		if (target < first - 30 * 60_000 || target > end + 30 * 60_000) {
			showClickLabel(lat, lon, 'Outside +144 h');
			return;
		}

		const index = forecastIntervalIndex(clickedPoint.times, target);

		if (index < 0) {
			showClickLabel(lat, lon, 'Forecast unavailable at this time');
			return;
		}

		const valid = clickedPoint.times[index],
			profile = buildProfile(clickedPoint.forecast, index),
			slr = wetBulbZeroHeight(profile),
			snowline = slr.snowLevelM !== null && Number.isFinite(slr.snowLevelM)
			? slr.snowLevelM
			: null;

		if (snowline === null) {
			const precip = precipMmAt(clickedPoint.forecast, index),
				phase = clickedMapElevationM !== null
				? phaseAt(clickedPoint, index, clickedMapElevationM)
				: null;

			const reason = slr.status === 'below-lowest-level'
			? 'WBZ is below the lowest resolved level or absent in a cold column'
			: 'No atmospheric crossing resolved';

			const detail = `<div class="snowline-valid">${shortValid(valid)}</div><div class="snowline-label-grid">${metricTile('Terrain', formatElevation(clickedMapElevationM, unitSystem), 'metric-terrain')}${metricTile('Precip', formatPrecip(precip, unitSystem), '')}</div><div class="snowline-event-line">${reason}. ${phase
			? precipitationLabel(phase)
			: precip !== null && precip < PRECIP_THRESHOLD_MM_H
				? 'Dry'
				: 'Precipitation type unavailable'}</div>`;

			showClickLabel(
				lat,
				lon,
				phase
				? `${phase.icon} ${precipitationLabel(phase).toUpperCase()}`
				: precip !== null && precip < PRECIP_THRESHOLD_MM_H
					? 'DRY'
					: 'WBZ unresolved',
				detail,
				'#fff',
				'neutral',
				phase?.key ?? null
			);

			return;
		}

		const rounded = Math.round(snowline / 10) * 10,
			tendency = tendencyText(clickedPoint, index),
			precip = precipMmAt(clickedPoint.forecast, index),
			hasPrecip = precip !== null && precip >= PRECIP_THRESHOLD_MM_H;

		if (clickedMapElevationM !== null && Number.isFinite(clickedMapElevationM)) {
			const terrain = Math.round(clickedMapElevationM / 10) * 10,
				difference = clickedMapElevationM - snowline,
				status = statusForDifference(difference),
				phase = hasPrecip
				? terrainPrecipitationType(profile, clickedMapElevationM)
				: null,
				summary = compactEventSummary(clickedPoint, clickedMapElevationM, target);

			clickedNextEventTime = summary.jumpTime;

			const grid = labelGrid({
				valid: shortValid(valid),
				terrain,
				snowline: rounded,
				difference,
				precip,
				hasPrecip,
				eventLine: summary.text,
				canJump: summary.jumpTime !== null
			}) + (slr.extrapolated
			? '<div class="forecast-quality">Snowline estimated below the resolved profile</div>'
			: '') + (phase?.confidence === 'low'
			? '<div class="forecast-quality">Limited atmospheric detail; type may differ</div>'
			: '');

			if (phase) {
				showClickLabel(lat, lon, `${phase.icon} ${precipitationLabel(phase).toUpperCase()}`, grid, colorForLevel(snowline), status, phase?.key ?? null);
				return;
			}

			showClickLabel(lat, lon, conditionLabel(precip, phase).toUpperCase(), grid, colorForLevel(snowline), status, phase?.key ?? null);
			return;
		}

		showClickLabel(lat, lon, formatElevation(rounded, unitSystem), `<div class="snowline-label-grid"><span><small>Valid</small><strong>${shortValid(valid)}</strong></span><span><small>Trend</small><strong>${tendency || '—'}</strong></span></div>`, colorForLevel(snowline), 'neutral');
	}

	async function probeLocation(lat, lon, source, placeName = null) {
		if (!enabled || destroyed || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
		placeAbort?.abort();
		placeAbort = null;
		const keep = chartOpen, my = ++clickGeneration;
		$$invalidate(18, clickedPoint = null);
		$$invalidate(19, clickedMapElevationM = null);
		clickedNextEventTime = null;
		clickedLatLon = [lat, lon];
		$$invalidate(20, clickedPlaceName = placeName);
		pointSource = source;
		$$invalidate(17, probeLoading = true);
		showClickLabel(lat, lon, 'Loading forecast…', '<div class="snowline-loading">Checking snow, timing and amounts</div>');
		if (!placeName) void updatePointPlaceName(lat, lon, my);

		try {
			const [point, elev, fields] = await Promise.all([
				loadPoint(lat, lon, 3),
				loadMapElevation(lat, lon),
				loadSelectedPrecipFields(lat, wrappedLongitude(lon), FORECAST_DAYS)
			]);

			if (my !== clickGeneration || pointSource !== source || !enabled || destroyed) return;

			if (!point || !point.times.length || !profileIsFresh(point.fetchedAt, point.runTime, activeRunTime)) {
				showClickLabel(lat, lon, 'Forecast unavailable', '<div class="snowline-loading">Select this place again to retry.</div>');
				return;
			}

			const aligned = alignSelectedPrecipFields(fields, point.times, point.runTime);

			$$invalidate(18, clickedPoint = Object.keys(aligned).length
			? {
					...point,
					forecast: { ...point.forecast, ...aligned }
				}
			: point);

			$$invalidate(19, clickedMapElevationM = elev);
			$$invalidate(18, clickedPoint.terrainM = elev, clickedPoint);
			lastChecked = Date.now();
			if (keep) $$invalidate(15, chartOpen = true);
			updatePersistentClickLabel();
		} finally {
			if (my === clickGeneration) $$invalidate(17, probeLoading = false);
		}
	}

	function isEnabled() {
		return enabled;
	}

	function selectMapPoint(lat, lon) {
		if (!enabled || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
		void probeLocation(lat, lon, 'map-click');
	}

	function handlePlaceSelect(event) {
		if (!enabled || !event?.detail) return;
		const { lat, lon, primary, secondary } = event.detail;
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
		const name = [primary, secondary].map(v => String(v ?? '').trim()).filter(Boolean).join(', ');
		pointSource = 'search';
		const selection = ++clickGeneration;
		map.panTo([lat, lon], { animate: true });

		setTimeout(
			() => {
				if (!destroyed && selection === clickGeneration && pointSource === 'search') void probeLocation(lat, lon, 'search', name || null);
			},
			120
		);
	}

	function handleSearchClear() {
		if (pointSource === 'search' && !chartOpen) clearPointState(true);
	}

	function lineLength(line) {
		let total = 0;

		for (let i = 1; i < line.length; i++) {
			const a = map.latLngToContainerPoint(line[i - 1]),
				b = map.latLngToContainerPoint(line[i]);

			total += Math.hypot(b.x - a.x, b.y - a.y);
		}

		return total;
	}

	function midpointAlongLine(line) {
		if (line.length < 2) return null;
		const total = lineLength(line);
		let travelled = 0;

		for (let i = 1; i < line.length; i++) {
			const a = map.latLngToContainerPoint(line[i - 1]),
				b = map.latLngToContainerPoint(line[i]),
				length = Math.hypot(b.x - a.x, b.y - a.y);

			if (length > 0 && travelled + length >= total / 2) {
				const f = (total / 2 - travelled) / length;

				return [
					line[i - 1][0] + f * (line[i][0] - line[i - 1][0]),
					line[i - 1][1] + f * (line[i][1] - line[i - 1][1])
				];
			}

			travelled += length;
		}

		return line[0];
	}

	function drawDeclutteredLabels(candidates, layer) {
		const size = map.getSize(),
			w = Number(size.x),
			h = Number(size.y),
			max = w < 520 ? 5 : w < 900 ? 8 : 12;

		const ordered = [...candidates].sort((a, b) => a.isMajor !== b.isMajor
		? a.isMajor ? -1 : 1
		: b.length - a.length);

		const occupied = [];

		for (const c of ordered) {
			if (occupied.length >= max) break;
			const p = map.latLngToContainerPoint(c.point);
			if (p.x < 54 || p.x > w - 54 || p.y < 24 || p.y > h - 60) continue;
			if (occupied.some(o => Math.abs(p.x - o.x) < 110 && Math.abs(p.y - o.y) < 38)) continue;

			L.marker(c.point, {
				interactive: false,
				icon: L.divIcon({
					className: 'snowline-label' + (c.isMajor ? ' snowline-label-major' : ' '),
					html: '<span style="--snowline-color:' + c.color + '">' + formatElevation(c.level, unitSystem) + '</span>',
					iconSize: [96, 22],
					iconAnchor: [48, 11]
				})
			}).addTo(layer);

			occupied.push({ x: p.x, y: p.y });
		}
	}

	function addTerrainHatching(field, layer, target) {
		const projected = field.map((row, r) => row.map((v, c) => {
			const point = map.latLngToLayerPoint([v.lat, v.lon]),
				terrain = cache[r]?.[c]?.terrainM;

			return {
				x: point.x,
				y: point.y,
				difference: dryTerrainDifference(mapPrecipAt(cache[r]?.[c] ?? null, target), terrain ?? null, v.value)
			};
		}));

		const lines = terrainHatchSegments(projected, 24).map(line => line.map(([x, y]) => map.layerPointToLatLng([x, y])));

		if (lines.length) L.polyline(lines, {
			color: '#ef70cf',
			weight: 1.8,
			opacity: .65,
			interactive: false,
			lineCap: 'butt',
			smoothFactor: 0
		}).addTo(layer);
	}

	function interpolatedSnowline(p, target) {
		const i = nearestIndex(p.times, target), t = p.times[i];
		if (t === target) return snowlineAt(p, i);
		const a = t < target ? i : i - 1, b = a + 1;
		if (a < 0 || b >= p.times.length) return snowlineAt(p, i);
		const lo = snowlineAt(p, a), hi = snowlineAt(p, b), gap = p.times[b] - p.times[a];
		if (lo === null || hi === null || gap <= 0 || gap > 3 * 3600_000) return null;
		return lo + (hi - lo) * (target - p.times[a]) / gap;
	}

	function mapPrecipAt(p, target) {
		if (!p) return null;
		const i = forecastIntervalIndex(p.times, target);
		return i < 0 ? null : precipMmAt(p.forecast, i);
	}

	function rasterZoom() {
		const b = currentBounds();
		return viewportRasterZoom(map.getSize().x, b.west, b.east, map.getZoom());
	}

	function phaseFrameKey(target) {
		const b = currentBounds(), size = map.getSize();

		const intervals = cache.flat().map(p => p && profileIsFresh(p.fetchedAt, p.runTime, activeRunTime)
		? forecastIntervalIndex(p.times, target)
		: -2);

		return JSON.stringify([
			weatherRevision,
			terrainRevision,
			activeRunTime,
			rasterZoom(),
			Number(map.getZoom()),
			size.x,
			size.y,
			b,
			showShading,
			showIcons,
			store.get('map'),
			intervals
		]);
	}

	function rememberFrame(key, frame) {
		if (frame.bytes > FRAME_PIXEL_BUDGET) return;
		frameCache.delete(key);
		frameCache.set(key, frame);

		while (frameCache.size > 6 || [...frameCache.values()].reduce((sum, f) => sum + f.bytes, 0) > FRAME_PIXEL_BUDGET) {
			const oldest = frameCache.keys().next().value;

			if (oldest === activePhaseKey && frameCache.size > 1) {
				const active = frameCache.get(oldest);
				frameCache.delete(oldest);
				frameCache.set(oldest, active);
				continue;
			}

			frameCache.delete(oldest);
		}
	}

	function applyFrame(key, frame) {
		const previous = [shadingLayer, precipIconLayer, geographyLayer];
		frame.shading.addTo(map);
		frame.icons.addTo(map);
		frame.geography?.addTo(map);
		shadingLayer = frame.shading;
		precipIconLayer = frame.icons;
		geographyLayer = frame.geography;
		activePhaseKey = key;
		pendingPhaseKey = key;

		for (const layer of previous) if (layer && layer !== shadingLayer && layer !== precipIconLayer && layer !== geographyLayer) try {
			map.removeLayer(layer);
		} catch {
			
		}

		$$invalidate(13, geographyError = frame.geographyError);

		$$invalidate(11, terrainDetailStatus = frame.fallback && !terrainLoading
		? 'Terrain detail unavailable here · coarse estimate'
		: '');

		$$invalidate(12, rasterLoading = false);
	}

	function scheduleNextFrame() {
		if (prefetchTimer || prefetchBusy || viewportLoading || terrainLoading || destroyed || !enabled) return;
		const point = cache.flat().find(p => !!p && profileIsFresh(p.fetchedAt, p.runTime, activeRunTime));
		if (!point) return;

		const i = forecastIntervalIndex(point.times, getStoreTimestamp()),
			next = point.times[i + 1];

		if (i < 0 || !Number.isFinite(next) || frameCache.has(phaseFrameKey(next))) return;

		prefetchTimer = setTimeout(
			() => {
				prefetchTimer = null;
				prefetchBusy = true;
				void paintShading(next, true).finally(() => prefetchBusy = false);
			},
			200
		);
	}

	function queueRasterPaint() {
		if (rasterTimer || destroyed || !enabled) return;

		rasterTimer = setTimeout(
			() => {
				rasterTimer = null;
				void paintShading(getStoreTimestamp());
			},
			80
		);
	}

	function renderPrecipitation(target) {
		if (!precipDetailAvailable || !showShading && !showIcons) {
			clearShading();
			return;
		}

		const pane = map.getPane(PRECIP_PANE) || map.createPane(PRECIP_PANE);
		pane.style.zIndex = '390';
		pane.style.pointerEvents = 'none';

		const b = currentBounds(),
			z = rasterZoom(),
			terrainKey = [z, b.south, b.north, b.west, b.east].join(':');

		if (terrainKey !== terrainJobKey) {
			terrainJobKey = terrainKey;
			const epoch = ++terrainGeneration;
			$$invalidate(8, terrainLoading = true);
			$$invalidate(11, terrainDetailStatus = '');

			void terrainTiles.ensure(b, z, () => epoch === terrainGeneration && enabled && !destroyed, () => {
				terrainRevision++;
				frameCache.clear();
				queueRasterPaint();
			}).then(() => {
				if (epoch !== terrainGeneration || destroyed || !enabled) return;
				$$invalidate(8, terrainLoading = false);
				queueRasterPaint();
			});
		}

		const key = phaseFrameKey(target);

		if (key !== pendingPhaseKey) {
			rasterEpoch++;
			pendingPhaseKey = key;

			if (rasterTimer) {
				clearTimeout(rasterTimer);
				rasterTimer = null;
			}
		}

		if (key === activePhaseKey && shadingLayer) {
			$$invalidate(12, rasterLoading = false);
			scheduleNextFrame();
			return;
		}

		const frame = frameCache.get(key);

		if (frame) {
			rememberFrame(key, frame);
			applyFrame(key, frame);
			scheduleNextFrame();
			return;
		}

		$$invalidate(12, rasterLoading = true);
		queueRasterPaint();
	}

	async function paintShading(target, background = false) {
		if (!enabled || !precipDetailAvailable || !showShading && !showIcons || destroyed || !cache.length) return;
		const key = phaseFrameKey(target), mainKey = phaseFrameKey(getStoreTimestamp());
		if (background && frameCache.has(key)) return;

		const epoch = background ? rasterEpoch : ++rasterEpoch,
			b = currentBounds(),
			z = rasterZoom(),
			detailZoom = Number(map.getZoom()),
			stencil = weatherInterpolator(cache),
			next = L.layerGroup(),
			geographyMasks = [];

		const obsolete = () => epoch !== rasterEpoch || destroyed || !enabled || background && mainKey !== phaseFrameKey(getStoreTimestamp());
		const profiles = new Map(), amounts = new Map();

		for (const p of cache.flat()) if (p && profileIsFresh(p.fetchedAt, p.runTime, activeRunTime)) {
			const i = forecastIntervalIndex(p.times, target);
			profiles.set(p, i < 0 ? [] : buildProfile(p.forecast, i));
			amounts.set(p, mapPrecipAt(p, target));
		}

		let fallback = false;

		function terrainLight(lat, lon) {
			const step = 360 / (256 * 2 ** terrainTileZoom(z)),
				cos = Math.max(.1, Math.cos(lat * Math.PI / 180));

			const n = terrainTiles.sample(lat + step * cos, lon, z),
				s = terrainTiles.sample(lat - step * cos, lon, z),
				e = terrainTiles.sample(lat, lon + step, z),
				w = terrainTiles.sample(lat, lon - step, z);

			if (n === null || s === null || e === null || w === null) return 1;

			const distance = 2 * step * cos * 111320,
				nx = -(e - w) / distance,
				ny = -(n - s) / distance;

			const diffuse = Math.max(0, (-0.5 * nx + .5 * ny + Math.SQRT1_2) / Math.hypot(nx, ny, 1));
			return .65 + .45 * diffuse;
		}

		function diagnose(lat, lon) {
			const neighbours = stencil(lat, lon);
			if (!neighbours || neighbours.some(v => !profiles.has(v.value))) return null;

			const amount = weightedScalar(neighbours, p => amounts.get(p) ?? null),
				shade = precipitationShade(amount, detailZoom);

			if (!shade) return null;

			const detailed = terrainTiles.sample(lat, lon, z),
				terrain = detailed ?? weightedScalar(neighbours, p => p.terrainM);

			if (terrain === null) return null;
			if (detailed === null) fallback = true;

			const profile = blendedProfile(
				neighbours.map(v => ({
					value: profiles.get(v.value),
					weight: v.weight
				})),
				wetBulbFromDewpoint
			);

			const phase = terrainPrecipitationType(profile, terrain);
			if (!phase) return null;

			return {
				phase,
				shade,
				coverage: wetCoverage(neighbours, p => amounts.get(p) ?? null) ?? 0
			};
		}

		try {
			if (showShading && [...amounts.values()].some(value => value !== null && value > 0)) {
				const tiles = visibleRasterTiles(b, z), centre = map.getCenter();

				tiles.sort((a, c) => {
					const x = tileLocation(a.x + .5, a.y + .5, z),
						y = tileLocation(c.x + .5, c.y + .5, z);

					return (x.lat - centre.lat) ** 2 + (x.lon - centre.lng) ** 2 - ((y.lat - centre.lat) ** 2 + (y.lon - centre.lng) ** 2);
				});

				for (const tile of tiles) {
					if (obsolete()) {
						next.clearLayers();
						return;
					}

					const canvas = document.createElement('canvas');
					canvas.width = RASTER_SAMPLES;
					canvas.height = RASTER_SAMPLES;
					const ctx = canvas.getContext('2d');
					if (!ctx) continue;
					const image = ctx.createImageData(RASTER_SAMPLES, RASTER_SAMPLES);
					let wet = false;

					for (let y = 0; y < RASTER_SAMPLES; y++) for (let x = 0; x < RASTER_SAMPLES; x++) {
						const p = tileLocation(tile.x + (x + .5) / RASTER_SAMPLES, tile.y + (y + .5) / RASTER_SAMPLES, z);
						if (p.lat < b.south || p.lat > b.north || p.lon < b.west || p.lon > b.east) continue;
						const result = diagnose(p.lat, p.lon);
						if (!result) continue;
						wet = true;

						const rgb = hexToRgb(PRECIP_TYPE_COLOURS[result.phase.key]).map(v => Math.round(result.shade.tone >= 0
							? v + (255 - v) * result.shade.tone
							: v * (1 + result.shade.tone))),
							i = (y * RASTER_SAMPLES + x) * 4;

						const light = terrainLight(p.lat, p.lon);
						image.data[i] = Math.min(255, Math.round(rgb[0] * light));
						image.data[i + 1] = Math.min(255, Math.round(rgb[1] * light));
						image.data[i + 2] = Math.min(255, Math.round(rgb[2] * light));
						image.data[i + 3] = Math.round(PRECIP_SHADING_OPACITY * 255);
					}

					if (wet) {
						ctx.putImageData(image, 0, 0);
						const full = document.createElement('canvas');
						full.width = TILE_SIZE;
						full.height = TILE_SIZE;
						const fc = full.getContext('2d');

						if (fc) {
							fc.imageSmoothingEnabled = false;
							fc.drawImage(canvas, 0, 0, TILE_SIZE, TILE_SIZE);

							const nw = tileLocation(tile.x, tile.y, z),
								se = tileLocation(tile.x + 1, tile.y + 1, z);

							geographyMasks.push({ canvas: full, nw, se, tile });
							precipRasterLayer(L, full.toDataURL('image/png'), nw, se, layerOrder?.BASE_MAP ?? 400, PRECIP_PANE, gl => nativeMap = gl).addTo(next);
						}
					}

					await new Promise(resolve => setTimeout(resolve, 0));
				}
			}

			if (obsolete()) {
				next.clearLayers();
				return;
			}

			const iconLayer = L.layerGroup(), size = map.getSize();
			let spacing = 72;
			while (Math.ceil(size.x / spacing) * Math.ceil(size.y / spacing) > 80) spacing += 8;

			if (showIcons && detailZoom >= PRECIP_DETAIL_MIN_ZOOM) for (let y = spacing / 2; y < size.y; y += spacing) for (let x = spacing / 2; x < size.x; x += spacing) {
				const p = map.containerPointToLatLng([x, y]), result = diagnose(p.lat, p.lng);
				if (!result) continue;

				L.marker([p.lat, p.lng], {
					interactive: false,
					keyboard: false,
					zIndexOffset: 1000,
					icon: L.divIcon({
						className: 'wintry-precip-icon',
						html: `<span role="img" aria-label="${result.phase.label}">${precipitationIconSvg(result.phase.key)}</span>`,
						iconSize: [28, 28],
						iconAnchor: [14, 14]
					})
				}).addTo(iconLayer);
			}

			if (obsolete()) {
				next.clearLayers();
				iconLayer.clearLayers();
				return;
			}

			const frame = {
				shading: next,
				icons: iconLayer,
				geography: null,
				fallback,
				geographyError: '',
				bytes: geographyMasks.length * TILE_SIZE * TILE_SIZE * 8 + iconLayer.getLayers().length * 4096
			};

			if (!background) applyFrame(key, frame);
			rememberFrame(key, frame);
			if (!background) scheduleNextFrame();
			void renderGeography(frame, key, geographyMasks, z);
		} catch(error) {
			next.clearLayers();
			console.warn('Wintry raster rendering failed', error);

			if (epoch === rasterEpoch && !background) {
				$$invalidate(12, rasterLoading = false);
				$$invalidate(11, terrainDetailStatus = 'Shading unavailable · retry refresh');
			}
		}
	}

	function clearStorms() {
		$$invalidate(9, stormLoading = false);
		stormEpoch++;
		stormAbort?.abort();
		stormAbort = null;
		stormKey = '';

		if (stormLayer) try {
			map.removeLayer(stormLayer);
		} catch {
			
		}

		stormLayer = null;
	}

	async function renderStorms() {
		if (!enabled || destroyed || (!showIcons || !precipDetailAvailable)) {
			clearStorms();
			return;
		}

		const target = getStoreTimestamp(), b = currentBounds(), zoom = map.getZoom();
		const key = [activeRunTime, target, zoom, b.south, b.north, b.west, b.east].join(':');
		if (key === stormKey) return;
		const saved = stormFrames.get(key);

		if (saved && Date.now() - saved.fetchedAt < 15 * 60_000) {
			clearStorms();
			stormKey = key;
			stormLayer = saved.layer.addTo(map);
			$$invalidate(10, stormStatus = saved.status);
			stormFrames.delete(key);
			stormFrames.set(key, saved);
			return;
		}

		clearStorms();
		stormKey = key;
		const epoch = stormEpoch, abort = stormAbort = new AbortController();
		$$invalidate(9, stormLoading = true);
		$$invalidate(10, stormStatus = '⚡ Forecast lightning');
		const tiles = new Map();

		const deadline = setTimeout(
			() => {
				abort.abort();

				if (epoch === stormEpoch) {
					stormKey = '';
					$$invalidate(10, stormStatus = '⚡ ECMWF lightning unavailable');
					$$invalidate(9, stormLoading = false);
				}
			},
			12000
		);

		try {
			const params = await createFullRenderingParams(
				'thunder',
				{
					product: 'ecmwf',
					overlay: 'thunder',
					level: 'surface',
					acRange: 3
				},
				target
			);

			if (epoch !== stormEpoch || abort.signal.aborted) return;
			const sample = await new Promise(resolve => (stormInterpolator ??= new TileLayerInterpolator()).createFun(resolve));
			const points = metricGrid(b, stormSpacing(zoom, (b.south + b.north) / 2), 80, false, Math.SQRT2).points.map(cell => stormSamplePoint(cell.bounds));
			const next = L.layerGroup();
			let known = 0, count = 0;
			const mapLibreZoom = map.maplibreMap?.getZoom?.() ?? zoom - 1;

			const dataZoom = getDataZoom(params, lightningTileZoomIndex(mapLibreZoom)),
				scale = 2 ** dataZoom;

			await mapLimit(points, 6, async p => {
				if (epoch !== stormEpoch || abort.signal.aborted) return;
				const phi = p.lat * Math.PI / 180, lon = wrappedLongitude(p.lon);

				const url = applyUrlTemplate(params.fullPath, {
					z: dataZoom,
					x: Math.floor((lon + 180) / 360 * scale),
					y: Math.floor((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2 * scale)
				});

				let pending = tiles.get(url);

				if (!pending) {
					pending = tileLayerSource.get(url, abort.signal);
					tiles.set(url, pending);
				}

				const token = await pending;
				if (!token?.value?.valid || abort.signal.aborted) return;
				const raw = await sample({ lat: p.lat, lon }, abort, params);
				const density = Array.isArray(raw) ? raw[0] : raw;
				if (typeof density === 'number' && Number.isFinite(density) && density >= 0) known++;
				if (!hasForecastLightning(density) || epoch !== stormEpoch || abort.signal.aborted) return;
				count++;

				L.marker([p.lat, p.lon], {
					interactive: false,
					keyboard: false,
					zIndexOffset: 1200,
					icon: L.divIcon({
						className: 'wintry-storm-symbol',
						html: '<span aria-label="ECMWF forecast lightning">⚡</span>',
						iconSize: [24, 28],
						iconAnchor: [12, 14]
					})
				}).addTo(next);
			});

			if (epoch !== stormEpoch || abort.signal.aborted) return;
			next.addTo(map);
			stormLayer = next;

			$$invalidate(10, stormStatus = known
			? `⚡ ECMWF forecast lightning · ${count ? 'activity shown' : 'none at sampled points'}`
			: '⚡ ECMWF lightning unavailable');

			if (known) {
				stormFrames.delete(key);

				stormFrames.set(key, {
					layer: next,
					status: stormStatus,
					fetchedAt: Date.now()
				});

				while (stormFrames.size > 6) stormFrames.delete(stormFrames.keys().next().value);
			}
		} catch(error) {
			if (epoch !== stormEpoch || abort.signal.aborted) return;
			stormKey = '';
			$$invalidate(10, stormStatus = '⚡ ECMWF lightning unavailable');
			console.warn('Wintry ECMWF lightning unavailable', error);
		} finally {
			if (epoch === stormEpoch) $$invalidate(9, stormLoading = false);
			clearTimeout(deadline);

			for (const pending of tiles.values()) void pending.then(
				token => {
					if (token) tileLayerSource.free(token);
				},
				() => {
					
				}
			);
		}
	}

	function renderFromCache() {
		void renderStorms();

		if (!enabled || !cache.length) {
			clearContours();
			clearShading();
			return;
		}

		const target = getStoreTimestamp(),
			firstPoint = cache.flat().find(p => p !== null && p.times.length > 0);

		if (!firstPoint) {
			clearContours();
			clearShading();
			return;
		}

		const first = firstPoint.times[0],
			end = Math.min(firstPoint.times.at(-1), first + MAX_FORECAST_HOURS * 3600_000);

		if (target < first - 30 * 60_000 || target > end + 30 * 60_000) {
			clearContours();
			clearShading();
			return;
		}

		renderPrecipitation(target);

		if (!showContours) {
			clearContours();
			return;
		}

		const field = [];

		for (let r = 0; r < cache.length; r++) {
			const row = [];

			for (let c = 0; c < cache[r].length; c++) {
				const p = cache[r][c];

				row.push(p && p.times.length
				? {
						lat: p.lat,
						lon: p.lon,
						value: interpolatedSnowline(p, target)
					}
				: { lat: 0, lon: 0, value: null });
			}

			field.push(row);
		}

		const interval = contourIntervalForZoom(),
			{ field: contourField, levels } = prepareSnowlineContours(field, interval);

		const next = L.layerGroup(), candidates = [];
		addTerrainHatching(field, next, target);
		const linesByLevel = contourLinesForLevels(contourField, levels);

		for (const level of levels) {
			const lines = linesByLevel.get(level).filter(line => line.length >= 2);
			if (!lines.length) continue;

			const is1000 = level % 1000 === 0,
				is500 = level % 500 === 0,
				color = colorForLevel(level),
				weight = is1000 ? 3 : is500 ? 2.2 : 1.5;

			const common = {
				interactive: false,
				lineCap: 'round',
				lineJoin: 'round',
				smoothFactor: .5
			};

			const [red, green, blue] = hexToRgb(color),
				brightness = .299 * red + .587 * green + .114 * blue;

			const casing = brightness > 150 ? '#14212b' : '#ffffff';

			L.polyline(lines, {
				...common,
				color: casing,
				weight: weight + 2,
				opacity: .95
			}).addTo(next);

			L.polyline(lines, { ...common, color, weight, opacity: 1 }).addTo(next);

			if (is1000 || level === -500 || interval === 100 && is500) {
				const ranked = lines.map(line => ({ line, length: lineLength(line) })).filter(x => x.length >= 110).sort((a, b) => b.length - a.length).slice(0, 3);

				for (const { line, length } of ranked) {
					const point = midpointAlongLine(line);

					if (point) candidates.push({
						point,
						level,
						color,
						length,
						isMajor: is1000
					});
				}
			}
		}

		drawDeclutteredLabels(candidates, next);
		next.addTo(map);
		const old = contourLayer;
		contourLayer = next;

		if (old) try {
			map.removeLayer(old);
		} catch {
			
		}
	}

	function toggleMapLayers() {
		void renderStorms();
		if (!showContours) clearContours();
		if (!showShading) clearShading();
		if (!showIcons) clearPrecipIcons();
		if (!enabled) return;
		if (cache.length) renderFromCache();
		if ((showContours || precipDetailAvailable && (showShading || showIcons)) && !cache.length) void refreshViewport();
	}

	function loadPreferences() {
		try {
			const p = JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) || '{}');
			if (typeof p.enabled === 'boolean') $$invalidate(3, enabled = p.enabled);
			if (typeof p.showContours === 'boolean') $$invalidate(0, showContours = p.showContours);
			if (typeof p.showShading === 'boolean') $$invalidate(1, showShading = p.showShading);
			if (typeof p.showIcons === 'boolean') $$invalidate(2, showIcons = p.showIcons);
			if (typeof p.panelHidden === 'boolean') $$invalidate(4, panelHidden = p.panelHidden);
			if (p.forecastTab === 'graph' || p.forecastTab === 'sounding') $$invalidate(5, forecastTab = p.forecastTab);
		} catch {
			
		}

		$$invalidate(6, unitSystem = loadUnitSystem());
		$$invalidate(30, prefsReady = true);
	}

	function persistPreferences() {
		if (!prefsReady) return;

		try {
			localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({
				enabled,
				panelHidden,
				forecastTab,
				showContours,
				showShading,
				showIcons
			}));
		} catch {
			
		}
	}

	function refreshUnitDependentUi() {
		if (renderedUnitSystem === unitSystem) return;
		renderedUnitSystem = unitSystem;
		if (!enabled) return;
		if (cache.length && !viewportLoading) renderFromCache();
		updatePersistentClickLabel();
	}

	function handleMapNavigation() {
		$$invalidate(7, precipDetailAvailable = Number(map.getZoom()) >= PRECIP_DETAIL_MIN_ZOOM);
		if (!precipDetailAvailable) clearShading();
		if (!enabled) return;
		clearStorms();
		$$invalidate(8, terrainLoading = false);
		terrainGeneration++;
		terrainJobKey = '';
		if (cache.length && (showShading || showIcons)) renderPrecipitation(getStoreTimestamp());
		if (moveTimer) clearTimeout(moveTimer);

		moveTimer = setTimeout(
			() => {
				void renderStorms();
				void refreshViewport();
			},
			350
		);
	}

	function toggleEnabled() {
		if (enabled) {
			register(config.name, 'high');
			void renderStorms();
			refreshViewport();
			return;
		}

		release(config.name, 'high');
		generation++;
		refreshEpoch++;
		pendingProfiles.clear();
		$$invalidate(16, viewportLoading = false);
		refreshQueued = false;

		if (moveTimer) {
			clearTimeout(moveTimer);
			moveTimer = null;
		}

		clearContours();
		clearShading();
		clearStorms();
		clearPointState(true);
	}

	onMount(() => {
		loadPreferences();
		if (!enabled) release(config.name, 'high');
		freshnessTimer = setInterval(checkAutomaticRefresh, 30_000);
		document.addEventListener('visibilitychange', checkAutomaticRefresh);
		window.addEventListener('online', checkAutomaticRefresh);
		map.on('moveend', handleMapNavigation);
		map.on('zoomend', handleMapNavigation);

		try {
			timestampListener = store.on('timestamp', () => {
				if (enabled && cache.length) renderFromCache(); else void renderStorms();
				if (enabled) updatePersistentClickLabel();
			});
		} catch {
			
		}

		void renderStorms();
		refreshViewport();
	});

	onDestroy(() => {
		destroyed = true;
		stormFrames.clear();
		placeAbort?.abort();
		for (const abort of forecastRequests) abort.abort();
		forecastRequests.clear();
		refreshEpoch++;
		pendingProfiles.clear();
		if (freshnessTimer) clearInterval(freshnessTimer);
		document.removeEventListener('visibilitychange', checkAutomaticRefresh);
		window.removeEventListener('online', checkAutomaticRefresh);
		generation++;
		clickGeneration++;
		refreshQueued = false;
		if (moveTimer) clearTimeout(moveTimer);
		map.off('moveend', handleMapNavigation);
		map.off('zoomend', handleMapNavigation);

		if (timestampListener !== null) try {
			store.off(timestampListener);
		} catch {
			
		}

		clearContours();
		clearShading();
		clearStorms();
		terrainTiles.destroy();
		geographicTiles.destroy();
		clearClickLayer();
		stormInterpolator?.destroy();
		stormInterpolator = null;
		profileCache.clear();
	});

	const click_handler = () => $$invalidate(4, panelHidden = false);
	const click_handler_1 = () => $$invalidate(4, panelHidden = true);

	function input0_change_handler() {
		enabled = this.checked;
		$$invalidate(3, enabled);
	}

	function input1_change_handler() {
		showContours = this.checked;
		$$invalidate(0, showContours);
	}

	function input2_change_handler() {
		showShading = this.checked;
		$$invalidate(1, showShading);
	}

	function input3_change_handler() {
		showIcons = this.checked;
		$$invalidate(2, showIcons);
	}

	const click_handler_2 = () => {
		$$invalidate(5, forecastTab = 'graph');
		$$invalidate(15, chartOpen = true);
	};

	const click_handler_3 = () => {
		$$invalidate(5, forecastTab = 'sounding');
		$$invalidate(15, chartOpen = true);
	};

	function v21panel_unitSystem_binding(value) {
		unitSystem = value;
		$$invalidate(6, unitSystem);
	}

	const click_handler_4 = () => $$invalidate(14, infoOpen = true);

	function snowlinechart_tab_binding(value) {
		forecastTab = value;
		$$invalidate(5, forecastTab);
	}

	const close_handler = () => $$invalidate(15, chartOpen = false);
	const click_handler_5 = () => $$invalidate(14, infoOpen = false);
	const click_handler_6 = () => $$invalidate(14, infoOpen = false);

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*prefsReady, enabled, panelHidden, forecastTab, showContours, showShading, showIcons*/ 1073741887) {
			if (prefsReady) {
				persistPreferences();
			}
		}

		if ($$self.$$.dirty[0] & /*prefsReady, unitSystem*/ 1073741888) {
			if (prefsReady) {
				refreshUnitDependentUi();
			}
		}
	};

	return [
		showContours,
		showShading,
		showIcons,
		enabled,
		panelHidden,
		forecastTab,
		unitSystem,
		precipDetailAvailable,
		terrainLoading,
		stormLoading,
		stormStatus,
		terrainDetailStatus,
		rasterLoading,
		geographyError,
		infoOpen,
		chartOpen,
		viewportLoading,
		probeLoading,
		clickedPoint,
		clickedMapElevationM,
		clickedPlaceName,
		activeRunTime,
		refreshError,
		refreshForecast,
		handlePlaceSelect,
		handleSearchClear,
		toggleMapLayers,
		toggleEnabled,
		isEnabled,
		selectMapPoint,
		prefsReady,
		click_handler,
		click_handler_1,
		input0_change_handler,
		input1_change_handler,
		input2_change_handler,
		input3_change_handler,
		click_handler_2,
		click_handler_3,
		v21panel_unitSystem_binding,
		click_handler_4,
		snowlinechart_tab_binding,
		close_handler,
		click_handler_5,
		click_handler_6
	];
}

class Plugin extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { isEnabled: 28, selectMapPoint: 29 }, add_css, [-1, -1, -1, -1, -1]);
	}

	get isEnabled() {
		return this.$$.ctx[28];
	}

	get selectMapPoint() {
		return this.$$.ctx[29];
	}
}

/* src\pluginEntry.svelte generated by Svelte v4.2.20 */

function create_fragment(ctx) {
	let plugin_1;
	let current;
	let plugin_1_props = {};
	plugin_1 = new Plugin({ props: plugin_1_props });
	/*plugin_1_binding*/ ctx[2](plugin_1);

	return {
		c() {
			create_component(plugin_1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(plugin_1, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const plugin_1_changes = {};
			plugin_1.$set(plugin_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(plugin_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(plugin_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			/*plugin_1_binding*/ ctx[2](null);
			destroy_component(plugin_1, detaching);
		}
	};
}

function normaliseLatLon(value) {
	if (!value) return null;
	const lat = Number(value.lat ?? value.latitude ?? value.latlng?.lat);
	const lon = Number(value.lon ?? value.lng ?? value.longitude ?? value.latlng?.lng);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	return { lat, lon };
}

function instance($$self, $$props, $$invalidate) {
	let plugin = null;

	function selectLocation(value) {
		const position = normaliseLatLon(value);
		if (!position) return;
		plugin?.selectMapPoint?.(position.lat, position.lon);
	}

	const onopen = params => {
		selectLocation(params);
	};

	onMount(() => {
		singleclick.on(config.name, selectLocation);
		if (plugin?.isEnabled?.()) register(config.name, 'high'); else release(config.name, 'high');
	});

	onDestroy(() => {
		singleclick.off(config.name, selectLocation);
		release(config.name, 'high');
	});

	function plugin_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			plugin = $$value;
			$$invalidate(0, plugin);
		});
	}

	return [plugin, onopen, plugin_1_binding];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 1 });
	}

	get onopen() {
		return this.$$.ctx[1];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
