const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js/loader.js'), 'utf8');

function element() {
  const classes = new Set(), listeners = new Map();
  return {
    attributes: {}, children: [], style: {}, textContent: '',
    classList: {
      add: name => classes.add(name), remove: name => classes.delete(name),
      contains: name => classes.has(name),
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, fn) { listeners.set(name, fn); },
    emit(name, event) { listeners.get(name)?.(event); },
    append(...nodes) { this.children.push(...nodes); },
    appendChild(node) { this.children.push(node); },
    insertBefore(node, reference) { this.children.splice(this.children.indexOf(reference), 0, node); },
    contains() { return false; },
  };
}

function runtime({ local = new Map(), session = new Map(), blockedLocal = false,
  blockedSession = false, reduced = false, hash = '', savedMotion = 'on' } = {}) {
  const timers = new Map(), subscribers = new Set();
  let now = 0, nextId = 0;
  const root = element(), loader = element(), body = element(), skip = element();
  const document = element();
  Object.assign(document, {
    documentElement: root, readyState: 'loading', activeElement: null,
    getElementById: id => ({ loader, loaderBody: body, loaderSkip: skip })[id],
    createElement: element,
  });
  const storage = (values, blocked) => ({
    getItem(key) { if (blocked) throw Error('blocked'); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error('blocked'); values.set(key, value); },
  });
  const motion = {
    enabled: savedMotion !== 'off' && !reduced,
    subscribe(fn) { subscribers.add(fn); fn(this.enabled); return () => subscribers.delete(fn); },
  };
  if (savedMotion === 'off') local.set('site-motion', 'off');
  const context = Object.assign(element(), {
    document, location: { hash }, SiteMotion: motion,
    localStorage: storage(local, blockedLocal), sessionStorage: storage(session, blockedSession),
    matchMedia: () => ({ matches: reduced }),
    setTimeout(fn, delay) { timers.set(++nextId, { fn, at: now + delay }); return nextId; },
    clearTimeout(id) { timers.delete(id); },
  });
  context.window = context;
  vm.runInNewContext(source, context);
  return {
    root, loader, body, skip, local, session, context, timers, subscribers,
    now: () => now,
    ready() { document.readyState = 'interactive'; document.emit('DOMContentLoaded'); },
    disableMotion() { motion.enabled = false; [...subscribers].forEach(fn => fn(false)); },
    async advance() {
      const [id, timer] = [...timers].sort((a, b) => a[1].at - b[1].at)[0] || [];
      if (!timer) return;
      timers.delete(id); now = timer.at; timer.fn();
      await Promise.resolve();
    },
    async finish() { while (timers.size) await this.advance(); },
  };
}

test('first visit shows a readable intro and remembers completion across tabs and reloads', async () => {
  const local = new Map();
  const r = runtime({ local });
  assert(r.root.classList.contains('intro-pending'));
  r.ready();
  assert(r.loader.classList.contains('active'));
  await r.advance();
  assert(r.loader.classList.contains('active'));
  assert.equal(r.local.has('intro-seen'), false);
  await r.finish();
  assert(r.now() >= 2000 && r.now() <= 4000);
  assert.equal(r.body.children.filter(node => node.className === 'loader-line done').length, 3);
  assert.equal(r.loader.attributes['aria-hidden'], 'true');
  assert(!r.loader.classList.contains('active'));
  assert.equal(local.get('intro-seen'), 'yes');
  assert.equal(r.subscribers.size, 0);
  for (const session of [r.session, new Map()]) {
    const revisit = runtime({ local, session });
    revisit.ready();
    assert(!revisit.root.classList.contains('intro-pending'));
    assert(!revisit.loader.classList.contains('active'));
    assert.equal(revisit.timers.size, 0);
  }
});

test('skip and motion changes dismiss immediately without appending later lines', async () => {
  for (const action of [r => r.skip.emit('click'), r => r.disableMotion()]) {
    const r = runtime(); r.ready();
    action(r);
    const count = r.body.children.length;
    await r.finish();
    assert.equal(r.body.children.length, count);
    assert(!r.loader.classList.contains('active'));
    assert.equal(r.local.get('intro-seen'), 'yes');
    assert.equal(r.subscribers.size, 0);
  }
});

test('anchor entry and disabled motion do not flash or consume the first intro', () => {
  for (const options of [{ hash: '#projects' }, { reduced: true }, { savedMotion: 'off' }]) {
    const r = runtime(options); r.ready();
    assert(!r.root.classList.contains('intro-pending'));
    assert(!r.loader.classList.contains('active'));
    assert.equal(r.local.has('intro-seen'), false);
    assert.equal(r.timers.size, 0);
  }
  const r = runtime();
  r.disableMotion(); r.ready();
  assert(!r.root.classList.contains('intro-pending'));
  assert(!r.loader.classList.contains('active'));
  assert.equal(r.local.has('intro-seen'), false);
});

test('old session visits migrate, and blocked storage still lets the intro finish', async () => {
  const previous = runtime({ session: new Map([['intro-seen', 'yes']]) });
  previous.ready();
  assert.equal(previous.local.get('intro-seen'), 'yes');
  assert(!previous.loader.classList.contains('active'));
  for (const blockedSession of [false, true]) {
    const r = runtime({ blockedLocal: true, blockedSession });
    r.ready(); await r.finish();
    assert(!r.loader.classList.contains('active'));
    assert(!r.root.classList.contains('intro-pending'));
    if (!blockedSession) {
      const revisit = runtime({ blockedLocal: true, session: r.session }); revisit.ready();
      assert(!revisit.loader.classList.contains('active'));
    }
  }
});

test('navigation and another tab completing the intro cancel unfinished playback', async () => {
  for (const [event, detail] of [['pagehide', {}], ['storage', { key: 'intro-seen', newValue: 'yes' }]]) {
    const r = runtime(); r.ready();
    r.context.emit(event, detail);
    await r.finish();
    assert(!r.loader.classList.contains('active'));
    assert.equal(r.body.children.filter(node => node.className === 'loader-line done').length, 0);
  }
});

test('delayed initialization releases the opening cover instead of blocking the page', async () => {
  const r = runtime();
  await r.finish();
  assert(!r.root.classList.contains('intro-pending'));
  r.ready();
  assert(!r.loader.classList.contains('active'));
  assert.equal(r.local.has('intro-seen'), false);
});
