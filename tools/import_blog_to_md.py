#!/usr/bin/env python3
"""Convert blog article HTML files into Markdown files for RAG ingestion."""

from __future__ import annotations

from dataclasses import dataclass, field
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import re


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = PROJECT_ROOT / "blog"
OUTPUT_DIR = PROJECT_ROOT / "rag-articles"


IGNORED_TAGS = {"nav", "footer", "script", "style", "canvas", "svg", "button"}
BLOCK_TAGS = {"h1", "h2", "p", "ul", "ol", "li", "blockquote", "pre", "code"}


@dataclass
class Node:
    tag: str
    attrs: dict[str, str] = field(default_factory=dict)
    children: list["Node | str"] = field(default_factory=list)


class BlogHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]
        self.title_node: Node | None = None
        self.article_node: Node | None = None
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key: value or "" for key, value in attrs}

        if self.ignored_depth:
            self.ignored_depth += 1
            return

        if tag in IGNORED_TAGS:
            self.ignored_depth = 1
            return

        node = Node(tag, attrs_dict)
        self.stack[-1].children.append(node)

        if tag == "h1" and self.title_node is None:
            self.title_node = node

        if tag == "article" and "blog-article-body" in attrs_dict.get("class", "").split():
            self.article_node = node

        if tag not in {"br", "img", "meta", "link", "input"}:
            self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        if self.ignored_depth:
            self.ignored_depth -= 1
            return

        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if not self.ignored_depth:
            self.stack[-1].children.append(data)

    def handle_entityref(self, name: str) -> None:
        self.handle_data(unescape(f"&{name};"))

    def handle_charref(self, name: str) -> None:
        self.handle_data(unescape(f"&#{name};"))


def normalize_inline(text: str) -> str:
    text = unescape(text)
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
    text = re.sub(r"\s+([，。！？、；：,.!?;:)])", r"\1", text)
    text = re.sub(r"([（(])\s+", r"\1", text)
    return text.strip()


def collect_text(node: Node) -> str:
    parts: list[str] = []

    def walk(current: Node | str) -> None:
        if isinstance(current, str):
            parts.append(current)
            return
        for child in current.children:
            if isinstance(child, str):
                parts.append(child)
            elif child.tag == "br":
                parts.append("\n")
            elif child.tag == "code":
                code_text = collect_text(child)
                if code_text:
                    parts.append(f"`{code_text}`")
            else:
                walk(child)

    walk(node)
    return normalize_inline("".join(parts))


def collect_pre_text(node: Node) -> str:
    parts: list[str] = []

    def walk(current: Node | str) -> None:
        if isinstance(current, str):
            parts.append(current)
            return
        for child in current.children:
            walk(child)

    walk(node)
    return unescape("".join(parts)).strip("\n")


def render_block(node: Node, in_list: bool = False) -> list[str]:
    tag = node.tag

    if tag == "h2":
        text = collect_text(node)
        return [f"## {text}"] if text else []

    if tag == "p":
        text = collect_text(node)
        return [text] if text else []

    if tag == "blockquote":
        text = collect_text(node)
        return [f"> {line}" for line in text.splitlines() if line.strip()]

    if tag == "pre":
        code = collect_pre_text(node)
        return ["```", code, "```"] if code else []

    if tag == "code" and not in_list:
        code = collect_pre_text(node)
        if "\n" in code:
            return ["```", code, "```"]
        return [f"`{normalize_inline(code)}`"] if code else []

    if tag in {"ul", "ol"}:
        lines: list[str] = []
        for child in node.children:
            if not isinstance(child, Node):
                continue
            if child.tag == "li":
                item_text = collect_text(child)
                if item_text:
                    lines.append(f"- {item_text}")
                nested_lists = [
                    nested
                    for nested in child.children
                    if isinstance(nested, Node) and nested.tag in {"ul", "ol"}
                ]
                for nested in nested_lists:
                    lines.extend(f"  {line}" for line in render_block(nested, in_list=True))
        return lines

    if tag == "li":
        text = collect_text(node)
        return [f"- {text}"] if text else []

    lines: list[str] = []
    for child in node.children:
        if isinstance(child, Node) and (child.tag in BLOCK_TAGS or child.children):
            rendered = render_block(child, in_list=in_list)
            if rendered:
                lines.extend(rendered)
                lines.append("")
    while lines and lines[-1] == "":
        lines.pop()
    return lines


def render_article(article: Node) -> str:
    blocks: list[str] = []
    for child in article.children:
        if not isinstance(child, Node):
            continue
        rendered = render_block(child)
        if rendered:
            blocks.append("\n".join(rendered))
    return "\n\n".join(block for block in blocks if block)


def parse_blog_file(path: Path) -> tuple[str, str] | None:
    parser = BlogHTMLParser()
    parser.feed(path.read_text(encoding="utf-8"))

    if parser.article_node is None:
        return None

    title = collect_text(parser.title_node) if parser.title_node else path.stem
    body = render_article(parser.article_node)
    return title or path.stem, body


def markdown_for(path: Path, title: str, body: str) -> str:
    return "\n".join(
        [
            "---",
            "type: article",
            "source: blog",
            f"original_file: {path.name}",
            "---",
            "",
            f"# {title}",
            "",
            body,
            "",
        ]
    )


def ensure_inside_project(path: Path) -> None:
    resolved = path.resolve()
    if resolved != PROJECT_ROOT and PROJECT_ROOT not in resolved.parents:
        raise RuntimeError(f"Refusing to write outside project: {resolved}")


def main() -> None:
    ensure_inside_project(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for source in sorted(BLOG_DIR.glob("*.html")):
        parsed = parse_blog_file(source)
        if parsed is None:
            continue

        title, body = parsed
        target = OUTPUT_DIR / f"{source.stem}.md"
        ensure_inside_project(target)
        target.write_text(markdown_for(source, title, body), encoding="utf-8")
        print(f"Converted: blog/{source.name} -> rag-articles/{target.name}")


if __name__ == "__main__":
    main()
