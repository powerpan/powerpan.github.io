#!/usr/bin/env python3
"""Render the personal bilingual site inside this template; no main-site writes.

python3 tools/build.py
Content snapshots: content/en.json and content/zh.json.
The original Chromatic Ink design generator is preserved in layout.py.
"""
from __future__ import annotations
import html
import json
import posixpath
import re
import sys
from pathlib import Path
sys.dont_write_bytecode = True
import layout

ROOT = Path(__file__).resolve().parent.parent
LANG, DATA, CURRENT = 'en', {}, ''
esc = layout.esc
BASE_HEAD, BASE_MASTHEAD, BASE_COLOPHON = layout.head, layout.masthead, layout.colophon


def t(en, zh):
    return zh if LANG == 'zh' else en


def relative(target):
    return posixpath.relpath(target, posixpath.dirname(CURRENT) or '.')


def references(markup):
    # Data uses location-independent markers, so root and both locales work in any subfolder.
    markup = re.sub(r'@page/([^"\s<>]+)', lambda m: relative(('zh/' if LANG == 'zh' else '') + m[1]), markup)
    return re.sub(r'@asset/([^"\s<>]+)', lambda m: relative(m[1]), markup)


def head(title, desc, p):
    result = BASE_HEAD(title, desc, p).replace('<html lang="en">', f'<html lang="{t("en", "zh-CN")}">')
    # A separate file adds Chinese font fallbacks; ink.css is the unchanged design reference.
    result = result.replace(f'<link rel="stylesheet" href="{p}css/ink.css">', f'<link rel="stylesheet" href="{p}css/ink.css">\n<link rel="stylesheet" href="{p}css/languages.css">\n<link rel="stylesheet" href="{p}css/sound.css">\n<script src="{p}js/ink-sound.js" defer></script>\n<noscript><style>[data-sound-toggle],.volume{{display:none!important}}</style></noscript>')
    counterpart = ('zh/' if LANG == 'en' else '') + CURRENT.removeprefix('zh/')
    result = result.replace('</head>', f'<link rel="alternate" hreflang="{t("zh-CN", "en")}" href="{relative(counterpart)}">\n</head>')
    return result


def language_link():
    counterpart = ('zh/' if LANG == 'en' else '') + CURRENT.removeprefix('zh/')
    return f'<a href="{relative(counterpart)}" data-language-switch hreflang="{t("zh-CN", "en")}" lang="{t("zh-CN", "en")}" aria-label="{t("Read this page in Chinese", "Read this page in English")}">{t("中文", "EN")}</a>'


def sound_button():
    return f'<button class="sound-switch" type="button" data-sound-toggle aria-pressed="false" aria-label="{t("Play background music", "播放背景音乐")}"><canvas class="sound-wave" aria-hidden="true"></canvas><span class="sound-label">{t("Sound", "音乐")}</span></button>'


def masthead(p, current=''):
    result = BASE_MASTHEAD(p, current)
    # Reuse existing metadata and menu-footer slots; no new control style or layout.
    result = result.replace(' aria-hidden="true"><span>Portfolio &amp; Journal</span>', '><span>Portfolio &amp; Journal</span>')
    result = result.replace('<span>Local <span data-clock>--:--:--</span></span>', language_link(), 1)
    result = result.replace('<span>Move to paint</span>', sound_button() + language_link())
    result = result.replace('<button class="theme-switch"', sound_button() + '\n        <button class="theme-switch"', 1)
    return result


def colophon(p):
    result = BASE_COLOPHON(p)
    socials = ''.join(f'<a href="{esc(s["href"])}"' + (' target="_blank" rel="noopener"' if s['href'].startswith('https:') else '') + f'>{esc(s["label"])}</a>' for s in DATA['home']['social'])
    result = result.replace('<a href="#">GitHub</a><a href="#">LinkedIn</a><a href="#">Twitter</a><a href="#">Email</a>', socials)
    result = result.replace(f'© YYYY [{DATA["name"]}].', f'© 2026 {DATA["name"]}.')
    motion = '<button type="button" data-motion-toggle aria-pressed="true">Motion: on</button>'
    result = result.replace(motion, motion + f'<br><button type="button" class="sound-text" data-sound-toggle aria-pressed="false">{t("Sound: off", "音乐：关闭")}</button>\n<label class="volume"><span class="meta">{t("Volume", "音量")}</span><input class="ink-range" type="range" min="0" max="1" step="0.05" value="0.6" data-sound-volume aria-label="{t("Music volume", "音乐音量")}"></label>')
    result += '\n<p class="sr-only" role="status" aria-live="polite" data-sound-status></p>'
    if LANG == 'zh':
        result = result.replace('Set in Instrument Serif &amp; Inter Tight. Ink simulated live in WebGL2.', '中文标题采用 Noto Serif SC，正文采用 Noto Sans SC。水墨以 WebGL2 实时模拟。')
    return result


def journal_row(a, p):
    title = esc(a['title'])
    return f'''<li><a class="journal-row" href="{p}{a['slug']}" data-topic="{a['topic']}" data-cursor="{t('Read','阅读')}">
        <span class="journal-date">{esc(a['date'][:7])} · {a['num']:02d}</span>
        <span class="journal-title"><span class="static">{title}</span><span class="marquee" aria-hidden="true"><span>{title} —&nbsp;</span><span>{title} —&nbsp;</span><span>{title} —&nbsp;</span></span></span>
        <span class="topic" data-topic="{a['topic']}">{esc(layout.TOPICS[a['topic']])}</span><span class="journal-time">{esc(a['readtime'])}</span></a></li>'''


def tags(values):
    return '<ul class="tags">' + ''.join(f'<li>{esc(v)}</li>' for v in values) + '</ul>'


def home(projects, articles):
    h = DATA['home']
    byn = {pr['num']: pr for pr in projects}
    rows = []
    for i, n in enumerate(h['featured']):
        pr = byn[n]
        rows.append(f'''<li><a class="work-row" href="work/{pr['slug']}" data-preview="{pr['images'][0][0]}" data-cursor="{t('View','查看')}">
            <span class="work-num">{i+1:02d}</span><span class="work-title">{esc(pr['title'])}</span><span class="work-cat">{esc(pr['tag'])}</span><span class="work-year">{esc(pr['year'])}</span></a></li>''')
    hues = ['var(--ultramarine)', 'var(--vermilion)', 'var(--saffron)', 'var(--viridian)', 'var(--magenta)', 'var(--sumi)']
    stack = []
    for i, exp in enumerate(h['experiences']):
        stack.append(f'''<li class="stack-card" style="--i:{i};--hue:{hues[i]}">
            <div class="stack-index" aria-hidden="true">{i+1:02d}</div><div class="stack-body">
                <p class="meta">{esc(exp['date'])}</p><h3>{esc(exp['title'])}</h3><p class="stack-org">{esc(exp['org'])}</p>
                <p>{esc(exp['desc'])}</p>{tags(exp['tags'])}</div></li>''')
    fields = []
    for i, field in enumerate(h['fields']):
        links = ' '.join(f'<a class="link-arrow" href="{esc(a["href"])}">{esc(a["label"])}</a>' for a in field['links'])
        fields.append(f'''<details class="field"{' open' if i == 0 else ''}><summary><h3>{esc(field['title'])}</h3><span aria-hidden="true">+</span></summary>
            <div class="field-body"><p class="meta">{esc(field['tools'])}</p><p>{esc(field['desc'])}</p>{links}</div></details>''')
    groups = []
    for g, group in enumerate(h['skill_groups']):
        skill_rows = []
        for skill in group['skills']:
            skill_rows.append(f'''<div class="skill" style="--v:{int(skill['value'])/100:.2f};--hue:{hues[g]}"><span>{esc(skill['name'])}</span><span class="meta">{esc(skill['value'])}%</span>
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path class="track" pathLength="1" d="M1 5 Q 25 3 50 5 T 99 5"/><path pathLength="1" d="M1 5 Q 25 2 50 5 T 99 5"/></svg></div>''')
        groups.append(f'<div class="skill-group"><h3>{esc(group["title"])}</h3>{"".join(skill_rows)}</div>')
    tools = ''.join(f'<span class="sphere-item">{esc(v)}</span>' for v in h['toolkit'])
    band = ''.join(f'<span>{esc(v)}</span><b>✺</b>' for v in h['marquee'])
    stats = ''.join(f'<div><dt>{esc(s["value"])}</dt><dd class="meta">{esc(s["label"])}</dd></div>' for s in h['stats'])
    activity_stats = ''.join(f'<div><strong>{esc(s["value"])}</strong><span class="meta">{esc(s["label"])}</span></div>' for s in h['activity']['stats'])
    quotes = ''.join(f'<template><span class="q">{esc(q["text"])}</span><span class="n">{esc(q["name"])}</span><span class="r">{esc(q["role"])}</span></template>' for q in h['quotes'])
    swatches = ''.join(f'<button class="swatch" type="button" data-ink="{ink}" style="--c:var(--{ink})" aria-label="{t("Paint with ", "选择墨色：")}{ink}" aria-pressed="false"></button>' for ink in layout.INKS)
    nodes = []
    for i, edu in enumerate(h['education']):
        nodes.append(f'<div class="chapter-node rise"' + (' style="--d:150ms"' if i else '') + f'><p class="meta">{esc(edu["status"])}</p><h3>{esc(edu["title"])}</h3><p>{esc(edu["degree"])}. {esc(edu["desc"])}</p>{tags(edu["tags"])}</div>')
    chapter_line = '<div class="chapter-line" aria-hidden="true"><svg viewBox="0 0 300 160" preserveAspectRatio="none"><path pathLength="1" d="M4 80 C 70 -10, 110 170, 150 80 S 240 -10, 296 80"/><circle cx="4" cy="80" r="5"/><circle cx="296" cy="80" r="5"/></svg></div>'
    milestones = ''.join(f'<li' + (' class="is-done"' if m['done'] else '') + f'>{esc(m["text"])}</li>' for m in h['milestones'])
    body = f'''
<section class="hero" data-ink-open aria-labelledby="page-heading">
    <div class="hero-top"><p class="kicker hero-kicker rise">{t('(Vol. 01) Portfolio &amp; journal','(Vol. 01) 作品与手记')}</p><p class="hero-role rise" style="--d:120ms">{esc(h['role'])}</p></div>
    <h1 class="hero-name" id="page-heading" data-split="chars">{esc(DATA['name'])}</h1>
    <div class="hero-foot"><p class="hero-roles rise" style="--d:300ms">{t('Currently','现在')} — <span class="roller" data-roles="{esc('|'.join(h['roles']))}"><span>{esc(h['roles'][0])}</span></span></p>
        <p class="hero-hint meta rise" style="--d:380ms">{t('Move to stir the ink · click to drop a new colour','移动指针搅动水墨 · 点击落下一抹新色')}</p>
        <a class="hero-scroll meta rise" style="--d:460ms" href="#about">{t('Scroll','向下滚动')} <i aria-hidden="true"></i></a></div>
    <div class="swatches" role="group" aria-label="{t('Ink colour','墨色')}">{swatches}</div>
</section>
<section class="section veil" id="about"><p class="kicker">(01) {t('About','关于我')}</p>
    <p class="manifesto-text" data-scrub>{h['about_heading']}</p><div class="about-grid"><p class="about-bio rise">{esc(h['bio'])}</p><dl class="stats rise" style="--d:120ms">{stats}</dl></div>
</section>
<div class="band" aria-hidden="true"><div class="band-track">{band}</div></div>
<section class="section" id="experience"><header class="section-head"><p class="kicker">(02) {t('Experience','经历')}</p><h2 data-split>{t('My <em>Journey</em>','成长<em>历程</em>')}</h2><p class="section-note rise">{esc(h['timeline_subtitle'])}</p></header><ol class="stack">{''.join(stack)}</ol></section>
<section class="section veil" id="work"><header class="section-head"><p class="kicker">(03) {t('Selected work','精选项目')}</p><h2 data-split>{t('Selected <em>Works</em>','精选<em>项目</em>')}</h2><p class="section-note rise">{t('Hover a title to lift its plate from the archive.','悬停标题，翻阅项目的画面。')}</p></header>
    <ol class="work-list">{''.join(rows)}</ol><div class="work-foot"><span class="meta">06 / {len(projects):02d}</span><a class="link-arrow" href="work/index.html">{t('The full archive →','查看全部项目 →')}</a></div><div class="work-preview" aria-hidden="true"><img alt="" src="{projects[0]['images'][0][0]}"><span class="work-preview-label"></span></div>
</section>
<section class="section" id="tech"><header class="section-head"><p class="kicker">(04) {t('Capabilities','技术能力')}</p><h2 data-split>{t('Tech <em>&amp; Craft</em>','技术<em>与实践</em>')}</h2><p class="section-note rise">{esc(h['tech_subtitle'])}</p></header>
    <div class="cap-grid"><div class="sphere" data-sphere data-cursor="{t('Drag','拖动')}" role="img" aria-label="{esc(t('Tools: ','技术栈：')+', '.join(h['toolkit']))}">{tools}<div class="sphere-core meta" aria-hidden="true">{esc(DATA['name'])}<br>{t('toolkit','技术栈')}</div></div><div class="fields">{''.join(fields)}</div></div><div class="skills">{''.join(groups)}</div>
</section>
<section class="section veil" id="code"><div class="specimen"><div class="specimen-text"><p class="kicker">(05) {t('Featured code','代码片段')}</p><h2 data-split>{h['code']['title']}</h2><p class="rise">{esc(h['code']['desc'])}</p>{tags(h['code']['tags']).replace('class="tags"','class="tags rise"')}</div>
    <figure class="specimen-window rise" style="--d:150ms"><div class="specimen-bar"><span>{esc(h['code']['file'])}</span><span>● ● ●</span></div><pre class="specimen-code" data-typewriter>{h['code']['html']}</pre></figure></div>
</section>
<section class="section veil" id="journal"><header class="section-head"><p class="kicker">(06) {t('Journal','手记')}</p><h2 data-split>{t('Latest <em>Writing</em>','最新<em>文章</em>')}</h2><p class="section-note rise">{t(f'{len(articles)} essays and notes. Hover a title and it starts to run.',f'{len(articles)} 篇文章与随笔，记录技术实践与思考。')}</p></header>
    <ol class="journal-list" style="list-style:none">{''.join(journal_row(a,'journal/') for a in articles[:6])}</ol><div class="work-foot"><span class="meta">06 / {len(articles)}</span><a class="link-arrow" href="journal/index.html">{t('Read the journal →','阅读全部文章 →')}</a></div>
</section>
<section class="section veil" id="github"><div class="activity-grid"><div class="activity-copy"><p class="kicker">(07) {t('Open source','开源')}</p><h2 data-split>{t('Open <em>Activity</em>','开源<em>活动</em>')}</h2><p class="rise">{esc(h['activity']['subtitle'])} · <a href="https://github.com/powerpan" target="_blank" rel="noopener">GitHub ↗</a></p></div>
    <div class="dots" data-dots aria-hidden="true"></div><div class="activity-stats rise">{activity_stats}</div></div>
</section>
<section class="section voices" id="testimonials" data-quotes><p class="kicker">(08) {t('Voices','他人评价')}</p><blockquote class="quote" aria-live="polite"></blockquote><p class="quote-author meta"><span class="quote-name"></span><span>/</span><span class="quote-role"></span></p><div class="quote-dots"></div>{quotes}</section>
<section class="section veil" id="next"><header class="section-head"><p class="kicker">(09) {t('Next chapter','下一站')}</p><h2 data-split>{t('System <em>Upgrade</em>','继续<em>进阶</em>')}</h2><p class="section-note rise">{esc(h['next_subtitle'])}</p></header><div class="chapter-grid">{chapter_line.join(nodes)}</div><ol class="milestones meta">{milestones}</ol></section>
<section class="section contact" id="contact" data-ink-open><p class="kicker">(10) {t('Contact','联系')}</p><h2 data-split>{h['contact']['heading']}</h2>
    <form class="form rise" data-contact action="https://contact.erichz.site" method="post">
        <label><span class="meta">{t('Name','姓名')}</span><input name="name" autocomplete="name" placeholder="{t('Your name','你的称呼')}" required></label>
        <label><span class="meta">{t('Email','邮箱')}</span><input name="email" type="email" autocomplete="email" placeholder="{t('Your email','你的邮箱')}" required></label>
        <label class="full"><span class="meta">{t('Message','消息')}</span><textarea name="message" placeholder="{t('What’s on your mind?','想聊些什么？')}" required></textarea></label>
        <div class="form-foot"><p class="form-status" role="status">{esc(h['contact']['desc'])}</p><button class="send" type="submit" data-magnetic>{t('Send →','发送 →')}</button></div>
    </form>
</section>'''
    return layout.page(t('Portfolio','作品与手记')+' — '+DATA['name'], h['bio'], '', body, loader=True)


def project_page(pr, projects):
    nxt = projects[(projects.index(pr) + 1) % len(projects)]
    hero = pr['images'][0]
    facts = ''.join(f'<div><dt class="meta">{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in pr['meta'])
    facts += f'<div><dt class="meta">{t("Index","编号")}</dt><dd>No. {pr["num"]:02d}</dd></div>'
    # Every image survives, distributed within the template's existing case-section figures.
    extras = [[] for _ in pr['sections']]
    for i, image in enumerate(pr['images'][1:]):
        extras[min(i, len(extras)-1)].append(image)
    sections = []
    for i, sec in enumerate(pr['sections']):
        figures = ''.join(f'<figure class="rise"><img src="{im[0]}" alt="{esc(im[1])}" width="{im[2]}" height="{im[3]}" loading="lazy" decoding="async"><figcaption>{esc(im[4] or im[1])}</figcaption></figure>' for im in extras[i])
        badges = '<div class="badges">' + ''.join(f'<span class="tag">{esc(b)}</span>' for b in pr['badges']) + '</div>' if i == 0 else ''
        sections.append(f'''<section class="case-section"><div class="case-section-label"><span class="num">{i+1:02d}</span><span class="meta">{t('Section','章节')}</span></div>
            <div class="case-section-copy prose"><h2 data-split>{esc(sec['title'])}</h2>{sec['body']}{badges}{figures}</div></section>''')
    if pr['videos']:
        videos = ''.join(f'<figure class="rise"><video src="{src}" poster="{poster}" width="{w}" height="{h}" controls muted loop playsinline preload="none" style="width:100%;height:auto;border-radius:16px"></video>' + (f'<figcaption>{esc(cap)}</figcaption>' if cap else '') + '</figure>' for src, poster, cap, w, h in pr['videos'])
        sections.append(f'<section class="case-section"><div class="case-section-label"><span class="num">▶</span><span class="meta">{t("Motion","动态")}</span></div><div class="case-section-copy"><h2 data-split>{t("In <em>motion</em>","动态<em>演示</em>")}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">{videos}</div></div></section>')
    body = f'''<div class="page"><p class="kicker"><a href="index.html">{t('Work','项目')}</a> / {esc(pr['tag'])}</p>
    <header class="case-hero"><h1 data-split>{esc(pr['title'])}</h1><p class="lede rise">{esc(pr['lede'])}</p></header><dl class="case-facts rise">{facts}</dl>
    <div class="case-media"><img src="{hero[0]}" alt="{esc(hero[1])}" width="{hero[2]}" height="{hero[3]}" loading="eager" decoding="async"></div><div class="case-body">{''.join(sections)}</div>
    <a class="next-case" href="{nxt['slug']}" data-cursor="{t('Next','下一个')}"><span class="meta">{t('Next project','下一个项目')} — {nxt['num']:02d}</span><strong>{esc(nxt['title'])}</strong></a></div>'''
    return layout.page(f'{pr["title"]} — {DATA["name"]}', pr['lede'], '../', body, current='work')


def article_page(a, articles):
    result = layout.article_page(a, articles)
    result = result.replace('<span>[Date]</span><span>[Reading time]</span>', f'<span>{esc(a["date"])}</span><span>{esc(a["readtime"])}</span>')
    return result


def localize_ui(markup):
    if LANG != 'zh':
        return markup
    labels = {
        'Skip to content':'跳至正文', 'Portfolio &amp; Journal':'作品与手记', 'Work':'项目', 'Journal':'文章',
        'About':'关于', 'Contact':'联系', 'Night':'夜间', 'Day':'日间', 'Menu':'菜单', 'Index':'目录',
        'Elsewhere':'更多', 'Settings':'设置', 'Colophon':'关于本站', 'Night paper':'夜间纸色',
        'Motion: on':'动效：开启', 'Motion: off':'动效：关闭', 'Back to top ↑':'返回顶部 ↑',
        'Local':'本地', 'paper':'纸色',
        'Mixing pigment':'调和墨色', 'All':'全部', 'All writing':'全部文章', 'All ':'全部 ',
        'writing':'文章', 'The ':'项目', 'archive':'档案', 'Topic':'专题', '← Journal':'← 文章',
        'Continue reading':'继续阅读', 'Related ':'相关', '← Previous':'← 上一篇', 'Next →':'下一篇 →',
        'Every article in the journal.':'全部文章与随笔。', 'Every project in the archive.':'全部项目案例。',
        '15 projects. Each one opens as a case study.':'15 个项目，记录各自的设计、实现与实践。',
        f'{len(DATA["articles"])} articles across six topics. Filter by colour, or search.':f'{len(DATA["articles"])} 篇文章，6 个专题。可按专题筛选，或搜索标题。',
    }
    def change(m):
        raw = m[1]
        stripped = raw.strip()
        key = raw if raw in labels else stripped
        if key in labels:
            return '>' + raw.replace(key, labels[key], 1) + '<'
        return m[0]
    markup = re.sub(r'>([^<>]+)<', change, markup)
    markup = markup.replace('<title>Work —', '<title>项目 —').replace('<title>Journal —', '<title>文章 —')
    markup = re.sub(r'>(\d+) articles<', r'>\1 篇文章<', markup)
    for a, b in [('Search the journal…','搜索文章…'), ('Search articles','搜索文章'),
                 (f'aria-label="{esc(DATA["name"])} — home"', f'aria-label="{esc(DATA["name"])} — 首页"'),
                 ('aria-label="Menu"','aria-label="菜单"'), ('aria-label="Search semantics"','aria-label="搜索语义"'),
                 ('aria-label="Primary"','aria-label="主导航"'), ('aria-label="Contents"','aria-label="目录"'),
                 ('aria-label="More articles"','aria-label="更多文章"'), ('aria-label="Topics"','aria-label="专题"'),
                 ('data-cursor="View"','data-cursor="查看"'), ('data-cursor="Prev"','data-cursor="上一篇"'),
                 ('data-cursor="Next"','data-cursor="下一个"')]:
        markup = markup.replace(a, b)
    return markup


def main():
    global LANG, DATA, CURRENT
    layout.head, layout.masthead, layout.colophon, layout.journal_row = head, masthead, colophon, journal_row
    total = 0
    for lang in ['en','zh']:
        LANG = lang
        DATA = json.loads((ROOT / 'content' / f'{lang}.json').read_text())
        layout.SITE = DATA['name']
        layout.TOPICS = {topic['num']:topic['label'] for topic in DATA['topics']}
        projects, articles = DATA['projects'], DATA['articles']
        for a in articles:
            a['sections'] = [(s['id'], s['title']) for s in a['sections']]
        pages = {'index.html':lambda:home(projects,articles), 'work/index.html':lambda:layout.work_index(projects), 'journal/index.html':lambda:layout.journal_index(articles)}
        pages.update({f'journal/topics/topic-{topic["num"]}.html':lambda k=topic['num']:layout.topic_page(k,articles) for topic in DATA['topics']})
        pages.update({f'journal/{a["slug"]}':lambda a=a:article_page(a,articles) for a in articles})
        pages.update({f'work/{pr["slug"]}':lambda pr=pr:project_page(pr,projects) for pr in projects})
        for rel, render in pages.items():
            CURRENT = f'zh/{rel}' if lang == 'zh' else rel
            value = render()
            # Design asset prefixes refer to the shared folder above the locale.
            value = re.sub(r'((?:src|href)=["\'])(\.\./)*(assets/|css/|js/)', lambda m:m[1]+relative(m[3])+'/', value)
            value = references(localize_ui(value))
            # The topic header is content, not a new design element.
            value = value.replace('Describe what this topic covers.', esc(next((x['desc'] for x in DATA['topics'] if rel == f'journal/topics/topic-{x["num"]}.html'), '')))
            value = re.sub(r'[ \t]+$', '', value, flags=re.MULTILINE)
            target = ROOT / CURRENT
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(value, encoding='utf8')
            total += 1
    print(f'Built {total} pages ({total // 2} English + {total // 2} Chinese) inside {ROOT.name}.')


if __name__ == '__main__':
    main()
