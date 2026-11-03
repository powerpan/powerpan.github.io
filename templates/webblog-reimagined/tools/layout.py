#!/usr/bin/env python3
"""Build the Chromatic Ink site.

Reads page content (titles, articles, case-study text, media) from the sibling
`webblog-template` folder and writes every page of this folder:

    index.html, work/, journal/, journal/topics/

Run from anywhere:  python3 tools/build.py [path/to/webblog-template]
Edit the homepage copy in HOME below; edit article and project content in the
template (or replace the extraction with your own data source).
"""
from __future__ import annotations

import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / 'webblog-template'
SITE = 'Name'
TOPICS = {1: 'Topic 1', 2: 'Topic 2', 3: 'Topic 3', 4: 'Topic 4', 5: 'Topic 5', 6: 'Topic 6'}
INKS = ['ultramarine', 'vermilion', 'saffron', 'viridian', 'magenta', 'sumi']


# --------------------------------------------------------------------------
# A very small DOM, enough to read the template's regular markup.
# --------------------------------------------------------------------------
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
        self.start = self.end = 0

    @property
    def classes(self):
        return (self.attrs.get('class') or '').split()

    def walk(self):
        for child in self.children:
            if isinstance(child, Node):
                yield child
                yield from child.walk()

    def find_all(self, tag=None, cls=None):
        return [n for n in self.walk() if (tag is None or n.tag == tag) and (cls is None or cls in n.classes)]

    def find(self, tag=None, cls=None):
        found = self.find_all(tag, cls)
        return found[0] if found else None

    def text(self):
        out = []
        for child in self.children:
            out.append(child.text() if isinstance(child, Node) else child)
        return re.sub(r'\s+', ' ', ''.join(out)).strip()


class Tree(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.root = Node('#root', {})
        self.stack = [self.root]
        self.offsets = [0]
        acc = 0
        for line in source.splitlines(keepends=True):
            acc += len(line)
            self.offsets.append(acc)
        self.feed(source)

    def pos(self):
        line, col = self.getpos()
        return self.offsets[line - 1] + col

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.stack[-1])
        node.start = self.pos()
        node.inner_start = node.start + len(self.get_starttag_text() or '')
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)
        else:
            node.end = node.inner_end = node.inner_start

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                node = self.stack[i]
                node.inner_end = self.pos()
                node.end = node.inner_end + len(f'</{tag}>')
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)

    def inner(self, node):
        return self.source[node.inner_start:node.inner_end]


def read(path):
    source = path.read_text(encoding='utf-8')
    return Tree(source)


def esc(text):
    return html.escape(text, quote=True)


def topic_num(label):
    m = re.search(r'(\d+)', label or '')
    return int(m.group(1)) if m else 1


# --------------------------------------------------------------------------
# Content extraction
# --------------------------------------------------------------------------
def load_articles():
    articles = []
    for path in sorted((SRC / 'blog').glob('article-*.html')):
        tree = read(path)
        num = int(re.search(r'(\d+)', path.stem).group(1))
        h1 = tree.root.find('h1')
        tag = tree.root.find(cls='blog-article-tag')
        sub = tree.root.find('p', 'detail-subtitle')
        body = tree.root.find('article', 'blog-article-body')
        body_html = tree.inner(body) if body else ''
        body_html = re.sub(r'\s*\breveal\b', '', body_html)
        sections = [(s.attrs.get('id', ''), (s.find('h2').text() if s.find('h2') else 'Introduction'))
                    for s in (body.find_all('section') if body else [])]
        related = [int(re.search(r'(\d+)', a.attrs['href']).group(1))
                   for a in tree.root.find_all('a', 'related-post-card') if re.search(r'article-(\d+)', a.attrs.get('href', ''))]
        articles.append({
            'num': num, 'slug': path.name,
            'title_html': re.sub(r'class="hl"', 'class="hl"', tree.inner(h1)) if h1 else f'Article {num}',
            'title': h1.text() if h1 else f'Article {num}',
            'topic': topic_num(tag.text() if tag else ''),
            'lede': sub.text() if sub else '',
            'body': body_html, 'sections': sections, 'related': related[:3],
        })
    return articles


def load_projects():
    projects = []
    for path in sorted((SRC / 'projects').glob('project-*.html')):
        tree = read(path)
        num = int(re.search(r'(\d+)', path.stem).group(1))
        h1 = tree.root.find('h1')
        tag = tree.root.find(cls='detail-tag')
        sub = tree.root.find('p', 'detail-subtitle')
        meta = [(m.find(cls='detail-meta-label').text(), m.find(cls='detail-meta-value').text())
                for m in tree.root.find_all(cls='detail-meta-item')
                if m.find(cls='detail-meta-label') and m.find(cls='detail-meta-value')]
        images = []
        for img in tree.root.find_all('img'):
            src = img.attrs.get('src', '')
            if src and src not in [i[0] for i in images]:
                images.append((src, img.attrs.get('alt', ''), img.attrs.get('width', '1920'), img.attrs.get('height', '1080')))
        videos = []
        for v in tree.root.find_all('video'):
            source = v.find('source')
            src = (source.attrs.get('src') if source else None) or v.attrs.get('src')
            if src:
                videos.append((src, v.attrs.get('poster', '')))
        sections = []
        for s in tree.root.find_all('section', 'detail-section'):
            title = s.find('h2')
            paras = [p.text() for p in s.find_all('p') if p.text()][:3]
            sections.append({'title': title.text() if title else 'Section', 'paras': paras})
        badges = [b.text() for b in tree.root.find_all(cls='detail-tech-badge')][:12]
        projects.append({
            'num': num, 'slug': path.name, 'title': h1.text() if h1 else f'Project {num}',
            'tag': tag.text() if tag else 'Category', 'lede': sub.text() if sub else '',
            'meta': meta[:4], 'images': images, 'videos': videos, 'sections': sections[:8], 'badges': badges,
        })
    return projects


# --------------------------------------------------------------------------
# Page chrome
# --------------------------------------------------------------------------
BOOT = ("<script>(()=>{const r=document.documentElement;let t,m;try{t=localStorage.getItem('ink-theme');m=localStorage.getItem('ink-motion')}catch(e){}"
        "t=t||(matchMedia('(prefers-color-scheme: dark)').matches?'night':'day');"
        "if(matchMedia('(prefers-reduced-motion: reduce)').matches)m='off';r.dataset.theme=t;r.dataset.motion=m||'on'})()</script>")


def head(title, desc, p):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#ede8df">
{BOOT}
<link rel="preload" href="{p}assets/fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{p}css/ink.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='26' fill='%23f6401a'/%3E%3Ccircle cx='40' cy='26' r='14' fill='%232337f2' fill-opacity='.85'/%3E%3C/svg%3E">
</head>'''


def masthead(p, current=''):
    def nav(href, label, key):
        cur = ' aria-current="page"' if key == current else ''
        return f'<a href="{href}"{cur}>{label}</a>'
    return f'''<a class="sr-only" href="#main">Skip to content</a>
<header class="masthead">
    <a class="brand" href="{p}index.html" aria-label="{SITE} — home">{SITE}<sup>®</sup></a>
    <div class="masthead-meta" aria-hidden="true"><span>Portfolio &amp; Journal</span><span>Local <span data-clock>--:--:--</span></span></div>
    <div class="masthead-right">
        <nav class="masthead-nav" aria-label="Primary">
            {nav(p + 'work/index.html', 'Work', 'work')}{nav(p + 'journal/index.html', 'Journal', 'journal')}{nav(p + 'index.html#about', 'About', 'about')}{nav(p + 'index.html#contact', 'Contact', 'contact')}
        </nav>
        <button class="theme-switch" type="button" data-theme-toggle aria-pressed="false"><span class="theme-switch-dot" aria-hidden="true"></span><span class="theme-switch-label">Night</span></button>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    </div>
</header>
<nav class="menu" id="menu" aria-label="Menu">
    <a href="{p}index.html">Index</a><a href="{p}work/index.html"><em>Work</em></a><a href="{p}journal/index.html">Journal</a><a href="{p}index.html#contact"><em>Contact</em></a>
    <div class="menu-foot meta"><span>Local <span data-clock>--:--:--</span></span><span>Move to paint</span></div>
</nav>'''


def colophon(p):
    return f'''<footer class="colophon">
    <div class="colophon-name" data-fit aria-hidden="true">{SITE}</div>
    <div class="colophon-grid">
        <div><p class="meta">Index</p><a href="{p}work/index.html">Work</a><a href="{p}journal/index.html">Journal</a><a href="{p}index.html#about">About</a><a href="{p}index.html#contact">Contact</a></div>
        <div><p class="meta">Elsewhere</p><a href="#">GitHub</a><a href="#">LinkedIn</a><a href="#">Twitter</a><a href="#">Email</a></div>
        <div><p class="meta">Settings</p><button type="button" data-theme-toggle aria-pressed="false"><span class="theme-switch-label">Night</span> paper</button><br><button type="button" data-motion-toggle aria-pressed="true">Motion: on</button></div>
        <div><p class="meta">Colophon</p><p>© YYYY [{SITE}]. Set in Instrument Serif &amp; Inter Tight. Ink simulated live in WebGL2.</p><a href="#" data-top>Back to top ↑</a></div>
    </div>
</footer>'''


def page(title, desc, p, body, current='', loader=False):
    loader_html = ''
    if loader:
        loader_html = '''<div class="loader" hidden aria-hidden="true"><div class="loader-inner"><span class="loader-count">000</span><div class="loader-row meta"><span>Mixing pigment</span><span class="loader-stroke"><i></i></span><span>Vol. 01</span></div></div></div>
<script>(()=>{let s=null;try{s=sessionStorage.getItem('ink-intro')}catch(e){}const r=document.documentElement;if(!s&&!location.hash&&r.dataset.motion!=='off')document.querySelector('.loader').hidden=false})()</script>'''
    return f'''{head(title, desc, p)}
<body{' data-ink="quiet"' if not loader else ''}>
<canvas id="ink" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
{loader_html}
<div class="cursor" aria-hidden="true"><span class="cursor-label"></span></div>
{masthead(p, current)}
<main id="main">
{body}
</main>
{colophon(p)}
<script src="{p}js/ink-fluid.js"></script>
<script src="{p}js/ink.js"></script>
</body>
</html>
'''


# --------------------------------------------------------------------------
# Homepage
# --------------------------------------------------------------------------
def home(projects, articles):
    featured = [1, 2, 3, 7, 5, 6]
    byn = {pr['num']: pr for pr in projects}
    work_rows = []
    for i, n in enumerate(featured):
        pr = byn.get(n)
        if not pr:
            continue
        img = pr['images'][0][0].replace('../', '') if pr['images'] else f'assets/images/image-{i + 1:02d}.svg'
        work_rows.append(f'''<li><a class="work-row" href="work/{pr['slug']}" data-preview="{esc(img)}" data-cursor="View">
            <span class="work-num">{i + 1:02d}</span><span class="work-title">{esc(pr['title'])}</span><span class="work-cat">{esc(pr['tag'])}</span><span class="work-year">20XX</span></a></li>''')
    journal_rows = []
    for a in articles[:6]:
        t = esc(a['title'])
        journal_rows.append(f'''<li><a class="journal-row" href="journal/{a['slug']}" data-topic="{a['topic']}" data-cursor="Read">
            <span class="journal-date">20XX.XX</span>
            <span class="journal-title"><span class="static">{t}</span><span class="marquee" aria-hidden="true"><span>{t} —&nbsp;</span><span>{t} —&nbsp;</span><span>{t} —&nbsp;</span></span></span>
            <span class="topic" data-topic="{a['topic']}">{TOPICS[a['topic']]}</span><span class="journal-time">— min</span></a></li>''')
    hues = ['var(--ultramarine)', 'var(--vermilion)', 'var(--saffron)', 'var(--viridian)', 'var(--magenta)', 'var(--sumi)']
    stack = []
    for i in range(6):
        stack.append(f'''<li class="stack-card" style="--i:{i};--hue:{hues[i]}">
            <div class="stack-index" aria-hidden="true">{i + 1:02d}</div>
            <div class="stack-body">
                <p class="meta">[Date range]</p>
                <h3>Experience {i + 1}</h3>
                <p class="stack-org">@ Organization {i + 1}</p>
                <p>Describe Experience {i + 1} here. Add your role, the work you contributed, and the skills or lessons you gained. Replace this text with your own background.</p>
                <ul class="tags"><li>Skill 1</li><li>Skill 2</li><li>Skill 3</li><li>Skill 4</li></ul>
            </div></li>''')
    tools = ''.join(f'<span class="sphere-item">Tool {i}</span>' for i in range(1, 20))
    tools += ''.join(f'<span class="sphere-item">Skill {i}</span>' for i in range(1, 9))
    fields = []
    field_tools = ['Tool 1 · Tool 2 · Tool 3 · Tool 4', 'Tool 5 · Tool 6 · Tool 7 · Tool 8', 'Tool 9 · Tool 10 · Tool 11 · Tool 12', 'Tool 13 · Tool 14 · Tool 15 · Tool 16']
    field_links = [15, 15, 12, 13]
    for i in range(4):
        fields.append(f'''<details class="field"{' open' if i == 0 else ''}><summary><h3>Field {i + 1}</h3><span aria-hidden="true">+</span></summary>
            <div class="field-body"><p class="meta">{field_tools[i]}</p><p>Describe your work in this field. Add the tools you use and the kinds of projects you enjoy.</p>
            <a class="link-arrow" href="work/project-{field_links[i]:02d}.html">Project {field_links[i]} ↗</a></div></details>''')
    groups = []
    k = 0
    sizes = [4, 4, 4, 3]
    for g in range(4):
        rows = []
        for _ in range(sizes[g]):
            k += 1
            v = 0.42 + ((k * 37) % 50) / 100
            rows.append(f'<div class="skill" style="--v:{v:.2f};--hue:{hues[g]}"><span>Skill {k}</span><span class="meta">—</span>'
                        f'<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path class="track" pathLength="1" d="M1 5 Q 25 3 50 5 T 99 5"/><path pathLength="1" d="M1 5 Q 25 2 50 5 T 99 5"/></svg></div>')
        groups.append(f'<div class="skill-group"><h3>Skill Group {g + 1}</h3>{"".join(rows)}</div>')
    band = ''.join(f'<span>Tool {i}</span><b>✺</b>' for i in range(1, 13))
    code = ('<span class="c">// Featured code — replace with your own snippet</span>\n'
            '<span class="k">export function</span> <span class="f">paint</span>(canvas, pigment) {\n'
            '  <span class="k">const</span> field = <span class="f">createFluid</span>(canvas, { curl: <span class="s">22</span> });\n'
            '  canvas.<span class="f">addEventListener</span>(<span class="s">\'pointermove\'</span>, (e) =&gt; {\n'
            '    field.<span class="f">splat</span>(e.x, e.y, e.movementX, e.movementY, pigment);\n'
            '  });\n'
            '  <span class="k">return</span> field.<span class="f">run</span>();\n'
            '}')
    quotes = ''.join(f'<template><span class="q">[Testimonial {i}] Replace this with a sentence someone said about your work.</span><span class="n">[Name]</span><span class="r">[Role / Organization]</span></template>' for i in range(1, 4))
    swatches = ''.join(f'<button class="swatch" type="button" data-ink="{ink}" style="--c:var(--{ink})" aria-label="Paint with {ink}" aria-pressed="false"></button>' for ink in INKS)
    body = f'''
<section class="hero" data-ink-open aria-labelledby="page-heading">
    <div class="hero-top">
        <p class="kicker hero-kicker rise">(Vol. 01) Portfolio &amp; journal</p>
        <p class="hero-role rise" style="--d:120ms">Your Role &amp; Specialty</p>
    </div>
    <h1 class="hero-name" id="page-heading" data-split="chars">{SITE}</h1>
    <div class="hero-foot">
        <p class="hero-roles rise" style="--d:300ms">Currently — <span class="roller" data-roles="Role 1|Role 2|Role 3"><span>Role 1</span></span></p>
        <p class="hero-hint meta rise" style="--d:380ms">Move to stir the ink · click to drop a new colour</p>
        <a class="hero-scroll meta rise" style="--d:460ms" href="#about">Scroll <i aria-hidden="true"></i></a>
    </div>
    <div class="swatches" role="group" aria-label="Ink colour">{swatches}</div>
</section>

<section class="section veil" id="about">
    <p class="kicker">(01) About</p>
    <p class="manifesto-text" data-scrub>Introduce your work, and share <em>your ideas</em> — the problems you love, the tools you trust, and the kind of things you want to put into the world next.</p>
    <div class="about-grid">
        <p class="about-bio rise">Introduce yourself here. Describe your interests, the work you enjoy, and the direction you want to explore. Replace this paragraph with your own biography, background, and goals.</p>
        <dl class="stats rise" style="--d:120ms">
            <div><dt>—</dt><dd class="meta">Projects</dd></div><div><dt>—</dt><dd class="meta">Years study</dd></div>
            <div><dt>—</dt><dd class="meta">OSS repos</dd></div><div><dt>—</dt><dd class="meta">GitHub stars</dd></div>
        </dl>
    </div>
</section>

<div class="band" aria-hidden="true"><div class="band-track">{band}</div></div>

<section class="section" id="experience">
    <header class="section-head">
        <p class="kicker">(02) Experience</p>
        <h2 data-split>My <em>Journey</em></h2>
        <p class="section-note rise">[Experience description] Six plates, stacked in the order they happened.</p>
    </header>
    <ol class="stack">{''.join(stack)}</ol>
</section>

<section class="section veil" id="work">
    <header class="section-head">
        <p class="kicker">(03) Selected work</p>
        <h2 data-split>Selected <em>Works</em></h2>
        <p class="section-note rise">Hover a title to lift its plate from the archive.</p>
    </header>
    <ol class="work-list">{''.join(work_rows)}</ol>
    <div class="work-foot"><span class="meta">06 of {len(projects):02d}</span><a class="link-arrow" href="work/index.html">The full archive →</a></div>
    <div class="work-preview" aria-hidden="true"><img alt="" src="assets/images/image-01.svg"><span class="work-preview-label"></span></div>
</section>

<section class="section" id="tech">
    <header class="section-head">
        <p class="kicker">(04) Capabilities</p>
        <h2 data-split>Tech <em>&amp; Craft</em></h2>
        <p class="section-note rise">[Tech stack description] Drag the sphere to spin it.</p>
    </header>
    <div class="cap-grid">
        <div class="sphere" data-sphere data-cursor="Drag" role="img" aria-label="Tools: Tool 1 to Tool 19">{tools}<div class="sphere-core meta" aria-hidden="true">{SITE}<br>toolkit</div></div>
        <div class="fields">{''.join(fields)}</div>
    </div>
    <div class="skills">{''.join(groups)}</div>
</section>

<section class="section veil" id="code">
    <div class="specimen">
        <div class="specimen-text">
            <p class="kicker">(05) Featured code</p>
            <h2 data-split>Code as <em>material</em></h2>
            <p class="rise">Describe a piece of code you are proud of: the problem, the constraint, and the elegant part. Replace this snippet with your own.</p>
            <ul class="tags rise"><li>Tag 1</li><li>Tag 2</li><li>Tag 3</li></ul>
        </div>
        <figure class="specimen-window rise" style="--d:150ms">
            <div class="specimen-bar"><span>paint.js</span><span>● ● ●</span></div>
            <pre class="specimen-code" data-typewriter>{code}</pre>
        </figure>
    </div>
</section>

<section class="section veil" id="journal">
    <header class="section-head">
        <p class="kicker">(06) Journal</p>
        <h2 data-split>Latest <em>Writing</em></h2>
        <p class="section-note rise">{len(articles)} essays and notes. Hover a title and it starts to run.</p>
    </header>
    <ol class="journal-list" style="list-style:none">{''.join(journal_rows)}</ol>
    <div class="work-foot"><span class="meta">06 of {len(articles)}</span><a class="link-arrow" href="journal/index.html">Read the journal →</a></div>
</section>

<section class="section veil" id="github">
    <div class="activity-grid">
        <div class="activity-copy"><p class="kicker">(07) Open source</p><h2 data-split>Open <em>Activity</em></h2><p class="rise">[Activity placeholder] Replace the field with your own contribution data.</p></div>
        <div class="dots" data-dots aria-hidden="true"></div>
        <div class="activity-stats rise"><div><strong>—</strong><span class="meta">Contributions</span></div><div><strong>—</strong><span class="meta">Repositories</span></div><div><strong>—</strong><span class="meta">Stars</span></div></div>
    </div>
</section>

<section class="section voices" id="testimonials" data-quotes>
    <p class="kicker">(08) Voices</p>
    <blockquote class="quote" aria-live="polite"></blockquote>
    <p class="quote-author meta"><span class="quote-name"></span><span>/</span><span class="quote-role"></span></p>
    <div class="quote-dots"></div>
    {quotes}
</section>

<section class="section veil" id="next">
    <header class="section-head">
        <p class="kicker">(09) Next chapter</p>
        <h2 data-split>System <em>Upgrade</em></h2>
        <p class="section-note rise">Describe the next step in your journey.</p>
    </header>
    <div class="chapter-grid">
        <div class="chapter-node rise"><p class="meta">[Status 1] · Organization 1</p><h3>Institution 1</h3><p>Degree or Role 1. Describe this stage of your journey.</p><ul class="tags"><li>Focus 1</li><li>Focus 2</li><li>Focus 3</li></ul></div>
        <div class="chapter-line" aria-hidden="true"><svg viewBox="0 0 300 160" preserveAspectRatio="none"><path pathLength="1" d="M4 80 C 70 -10, 110 170, 150 80 S 240 -10, 296 80"/><circle cx="4" cy="80" r="5"/><circle cx="296" cy="80" r="5"/></svg></div>
        <div class="chapter-node rise" style="--d:150ms"><p class="meta">[Status 2] · Organization 2</p><h3>Institution 2</h3><p>Degree or Role 2. Describe the next stage.</p><ul class="tags"><li>Focus 1</li><li>Focus 2</li><li>Focus 3</li></ul></div>
    </div>
    <ol class="milestones meta"><li class="is-done">Milestone 1</li><li class="is-done">Milestone 2</li><li>Milestone 3</li><li>Milestone 4</li></ol>
</section>

<section class="section contact" id="contact" data-ink-open>
    <p class="kicker">(10) Contact</p>
    <h2 data-split>Got an idea? Let’s make it <em>vivid.</em></h2>
    <form class="form rise" data-demo>
        <label><span class="meta">Name</span><input name="name" autocomplete="name" placeholder="Your name" required></label>
        <label><span class="meta">Email</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
        <label class="full"><span class="meta">Message</span><textarea name="message" placeholder="What’s on your mind?"></textarea></label>
        <div class="form-foot"><p class="form-status" role="status">Whether it’s collaboration or a conversation, write any time.</p><button class="send" type="submit" data-magnetic>Send →</button></div>
    </form>
</section>'''
    return page(f'Portfolio — {SITE}', 'Portfolio and journal template, painted live in ink.', '', body, loader=True)


# --------------------------------------------------------------------------
# Journal
# --------------------------------------------------------------------------
def journal_row(a, p):
    t = esc(a['title'])
    return f'''<li><a class="journal-row" href="{p}{a['slug']}" data-topic="{a['topic']}" data-cursor="Read">
        <span class="journal-date">20XX.XX · {a['num']:02d}</span>
        <span class="journal-title"><span class="static">{t}</span><span class="marquee" aria-hidden="true"><span>{t} —&nbsp;</span><span>{t} —&nbsp;</span><span>{t} —&nbsp;</span></span></span>
        <span class="topic" data-topic="{a['topic']}">{TOPICS[a['topic']]}</span><span class="journal-time">— min</span></a></li>'''


def journal_index(articles):
    counts = {k: sum(1 for a in articles if a['topic'] == k) for k in TOPICS}
    chips = '<button class="filter" type="button" data-filter="all" aria-pressed="true">All <sup>{}</sup></button>'.format(len(articles))
    chips += ''.join(f'<button class="filter" type="button" data-filter="{k}" data-topic="{k}" aria-pressed="false">{v} <sup>{counts[k]}</sup></button>' for k, v in TOPICS.items())
    rows = ''.join(journal_row(a, '') for a in articles)
    body = f'''<div class="page">
    <header class="page-head"><p class="kicker">Journal</p><h1 data-split>All <em>writing</em></h1><p class="rise">{len(articles)} articles across six topics. Filter by colour, or search.</p></header>
    <div class="page-surface">
        <div class="filters" role="group" aria-label="Topics">{chips}</div>
        <input class="search" type="search" placeholder="Search the journal…" aria-label="Search articles">
        <p class="archive-count" role="status"></p>
        <ol class="journal-list" data-archive style="list-style:none">{rows}</ol>
    </div>
</div>'''
    return page(f'Journal — {SITE}', 'Every article in the journal.', '../', body, current='journal')


def topic_page(k, articles):
    rows = ''.join(journal_row(a, '../') for a in articles if a['topic'] == k)
    n = sum(1 for a in articles if a['topic'] == k)
    body = f'''<div class="page">
    <header class="page-head"><p class="kicker"><a href="../index.html">Journal</a> / Topic</p><h1 data-split><em>{esc(TOPICS[k])}</em></h1><p class="rise" data-topic="{k}"><span class="topic" data-topic="{k}">{n} articles</span><br>Describe what this topic covers.</p></header>
    <div class="page-surface"><ol class="journal-list" style="list-style:none">{rows}</ol></div>
</div>'''
    return page(f'{TOPICS[k]} — {SITE}', f'Articles about {TOPICS[k]}.', '../../', body, current='journal')


def article_page(a, articles):
    byn = {x['num']: x for x in articles}
    toc = ''.join(f'<a href="#{esc(sid)}">{esc(title)}</a>' for sid, title in a['sections'] if sid)
    prev_a = byn.get(a['num'] - 1) or articles[-1]
    next_a = byn.get(a['num'] + 1) or articles[0]
    related = ''.join(journal_row(byn[n], '') for n in a['related'] if n in byn)
    body = f'''<div class="progress" aria-hidden="true"><i></i></div>
<div class="page">
    <header class="article-head">
        <p class="meta"><a href="index.html">← Journal</a> &nbsp;/&nbsp; <span class="topic" data-topic="{a['topic']}">{TOPICS[a['topic']]}</span></p>
        <h1 data-split>{a['title_html']}</h1>
        <p class="lede rise">{esc(a['lede'])}</p>
        <div class="article-meta meta rise" style="--d:120ms"><span>[Date]</span><span>[Reading time]</span><span>No. {a['num']:02d}</span></div>
    </header>
    <div class="article-layout">
        <nav class="toc" aria-label="Contents">{toc}</nav>
        <div class="page-surface"><div class="prose">{a['body']}</div></div>
    </div>
    <section class="related" aria-labelledby="related-title"><p class="kicker">Continue reading</p><h2 id="related-title">Related <em>writing</em></h2><ol class="journal-list" style="list-style:none">{related}</ol></section>
    <nav class="pager" aria-label="More articles">
        <a href="{prev_a['slug']}" data-cursor="Prev"><span class="meta">← Previous</span><strong>{esc(prev_a['title'])}</strong></a>
        <a href="{next_a['slug']}" data-cursor="Next"><span class="meta">Next →</span><strong>{esc(next_a['title'])}</strong></a>
    </nav>
</div>'''
    return page(f"{a['title']} — {SITE}", a['lede'] or a['title'], '../', body, current='journal')


# --------------------------------------------------------------------------
# Work
# --------------------------------------------------------------------------
def work_index(projects):
    cards = []
    for pr in projects:
        img = pr['images'][0] if pr['images'] else ('../assets/images/image-01.svg', '', '1920', '1080')
        cards.append(f'''<a class="work-card rise" href="{pr['slug']}" data-cursor="View">
            <div class="work-card-media"><img src="{esc(img[0])}" alt="" loading="lazy" decoding="async"></div>
            <p class="meta">{pr['num']:02d} · {esc(pr['tag'])}</p><h2>{esc(pr['title'])}</h2></a>''')
    body = f'''<div class="page">
    <header class="page-head"><p class="kicker">Work</p><h1 data-split>The <em>archive</em></h1><p class="rise">{len(projects)} projects. Each one opens as a case study.</p></header>
    <div class="work-grid">{''.join(cards)}</div>
</div>'''
    return page(f'Work — {SITE}', 'Every project in the archive.', '../', body, current='work')


def project_page(pr, projects):
    nxt = projects[(projects.index(pr) + 1) % len(projects)]
    hero = pr['images'][0] if pr['images'] else ('../assets/images/image-01.svg', '', '1920', '1080')
    facts = pr['meta'] or [('Role', '[Role]'), ('Year', '[Year]'), ('Stack', '[Stack]')]
    facts_html = ''.join(f'<div><dt class="meta">{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in facts)
    facts_html += f'<div><dt class="meta">Index</dt><dd>No. {pr["num"]:02d}</dd></div>'
    extra = pr['images'][1:]
    sections = []
    for i, s in enumerate(pr['sections'] or [{'title': 'Overview', 'paras': [pr['lede']]}]):
        paras = ''.join(f'<p>{esc(t)}</p>' for t in s['paras'])
        fig = ''
        if i < len(extra):
            src, alt, w, h = extra[i]
            fig = f'<figure class="rise"><img src="{esc(src)}" alt="{esc(alt)}" width="{esc(w)}" height="{esc(h)}" loading="lazy" decoding="async"><figcaption>Figure {i + 1:02d}</figcaption></figure>'
        if i == 0 and pr['badges']:
            paras += '<div class="badges">' + ''.join(f'<span class="tag">{esc(b)}</span>' for b in pr['badges']) + '</div>'
        sections.append(f'''<section class="case-section">
            <div class="case-section-label"><span class="num">{i + 1:02d}</span><span class="meta">Section</span></div>
            <div class="case-section-copy"><h2 data-split>{esc(s['title'])}</h2>{paras}{fig}</div></section>''')
    if pr['videos']:
        vids = ''.join(f'<figure class="rise"><video src="{esc(src)}" poster="{esc(poster)}" controls muted loop playsinline preload="none" style="width:100%;border-radius:16px"></video></figure>'
                       for src, poster in pr['videos'])
        sections.append(f'''<section class="case-section"><div class="case-section-label"><span class="num">▶</span><span class="meta">Motion</span></div>
            <div class="case-section-copy"><h2 data-split>In <em>motion</em></h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">{vids}</div></div></section>''')
    body = f'''<div class="page">
    <p class="kicker"><a href="index.html">Work</a> / {esc(pr['tag'])}</p>
    <header class="case-hero"><h1 data-split>{esc(pr['title'])}</h1><p class="lede rise">{esc(pr['lede'])}</p></header>
    <dl class="case-facts rise">{facts_html}</dl>
    <div class="case-media"><img src="{esc(hero[0])}" alt="{esc(hero[1])}" loading="eager" decoding="async"></div>
    <div class="case-body">{''.join(sections)}</div>
    <a class="next-case" href="{nxt['slug']}" data-cursor="Next"><span class="meta">Next project — {nxt['num']:02d}</span><strong>{esc(nxt['title'])}</strong></a>
</div>'''
    return page(f"{pr['title']} — {SITE}", pr['lede'] or pr['title'], '../', body, current='work')


def main():
    if not (SRC / 'blog').exists():
        sys.exit(f'Template not found at {SRC}')
    articles, projects = load_articles(), load_projects()
    out = {'index.html': home(projects, articles), 'journal/index.html': journal_index(articles), 'work/index.html': work_index(projects)}
    for k in TOPICS:
        out[f'journal/topics/topic-{k}.html'] = topic_page(k, articles)
    for a in articles:
        out[f"journal/{a['slug']}"] = article_page(a, articles)
    for pr in projects:
        out[f"work/{pr['slug']}"] = project_page(pr, projects)
    for rel, text in out.items():
        path = ROOT / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
    print(f'Wrote {len(out)} pages ({len(articles)} articles, {len(projects)} projects) from {SRC}')


if __name__ == '__main__':
    sys.exit('Layout components only. Run python3 tools/build.py to build the personal bilingual site.')
