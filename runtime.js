/* Mini runtime per la demo Luxia: template con {{ }}, <sc-if>, <sc-for>, stato e aggiornamento del DOM. */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
      if (this.__schedule) this.__schedule();
    }
  }
  window.DCLogic = DCLogic;

  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  var ONLY = /^\s*\{\{\s*([\w.$]+)\s*\}\}\s*$/;
  var EVENTS = { onclick: 'click', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', onfocus: 'focus', onblur: 'blur', onchange: 'input', oninput: 'input' };

  function get(scope, path) {
    var parts = path.split('.'), v = scope[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = get(scope, p); return v == null ? '' : String(v); });
  }

  function build(node, scope, out) {
    if (node.nodeType === 3 && /^\s*$/.test(node.nodeValue) && node.nodeValue.indexOf('\n') >= 0) return;
    if (node.nodeType === 3) { out.push(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'helmet') return;
    if (tag === 'sc-if') {
      var m = ONLY.exec(node.getAttribute('value') || '');
      if (m && get(scope, m[1])) node.childNodes.forEach(function (c) { build(c, scope, out); });
      return;
    }
    if (tag === 'sc-for') {
      var lm = ONLY.exec(node.getAttribute('list') || ''), as = node.getAttribute('as') || 'item';
      var list = lm ? get(scope, lm[1]) : null;
      (list || []).forEach(function (it, idx) {
        var s = Object.create(scope); s[as] = it; s.$index = idx;
        node.childNodes.forEach(function (c) { build(c, s, out); });
      });
      return;
    }
    var el = node.namespaceURI === 'http://www.w3.org/2000/svg'
      ? document.createElementNS(node.namespaceURI, node.localName)
      : document.createElement(tag);
    el.__ev = {};
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], name = a.name, val = a.value;
      if (name.indexOf('hint-') === 0) continue;
      var only = ONLY.exec(val);
      if (EVENTS[name]) { if (only) { var fn = get(scope, only[1]); if (typeof fn === 'function') el.__ev[EVENTS[name]] = fn; } continue; }
      if (name === 'value' && (tag === 'input' || tag === 'textarea')) { el.__value = only ? (get(scope, only[1]) ?? '') : val; continue; }
      el.setAttribute(name, interp(val, scope));
    }
    var kids = [];
    node.childNodes.forEach(function (c) { build(c, scope, kids); });
    kids.forEach(function (k) { el.appendChild(k); });
    applyLive(el);
    out.push(el);
  }

  function applyLive(el) {
    ['click', 'mouseenter', 'mouseleave', 'focus', 'blur', 'input'].forEach(function (t) { el['on' + t] = el.__ev[t] || null; });
    if (el.__value !== undefined && el.value !== String(el.__value)) el.value = el.__value;
  }

  function morph(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b); return; }
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    var i, n;
    for (i = 0; i < b.attributes.length; i++) { n = b.attributes[i]; if (a.getAttribute(n.name) !== n.value) a.setAttribute(n.name, n.value); }
    for (i = a.attributes.length - 1; i >= 0; i--) {
      n = a.attributes[i].name;
      if (!b.hasAttribute(n) && !(n === 'open' && a.localName === 'details')) a.removeAttribute(n);
    }
    a.__ev = b.__ev || {};
    if (b.__value !== undefined) { a.__value = b.__value; if (document.activeElement !== a && a.value !== String(b.__value)) a.value = b.__value; }
    ['click', 'mouseenter', 'mouseleave', 'focus', 'blur', 'input'].forEach(function (t) { a['on' + t] = a.__ev[t] || null; });
    var ac = a.childNodes, bc = Array.prototype.slice.call(b.childNodes);
    for (i = 0; i < bc.length; i++) { if (i < ac.length) morph(ac[i], bc[i]); else a.appendChild(bc[i]); }
    while (ac.length > bc.length) a.removeChild(a.lastChild);
  }

  function boot() {
    var root = document.querySelector('x-dc');
    var script = document.querySelector('script[data-dc-script]');
    if (!root || !script) return;
    var tpl = document.createElement('template');
    while (root.firstChild) tpl.content.appendChild(root.firstChild);
    var helmet = tpl.content.querySelector('helmet');
    if (helmet) Array.prototype.slice.call(helmet.childNodes).forEach(function (c) { if (c.nodeType === 1) document.head.appendChild(c); });
    var Component = new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic);
    var comp = new Component({});
    var mount = document.createElement('div'); mount.id = 'app'; root.replaceWith(mount);
    var pending = false;
    function render() {
      pending = false;
      var vals = comp.renderVals(), out = [];
      tpl.content.childNodes.forEach(function (c) { build(c, vals, out); });
      var holder = document.createElement('div');
      out.forEach(function (n) { holder.appendChild(n); });
      if (!mount.firstChild) { while (holder.firstChild) mount.appendChild(holder.firstChild); }
      else morph(mount, holder);
    }
    comp.__schedule = function () { if (!pending) { pending = true; Promise.resolve().then(render); } };
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
