from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "archive" / "manifest.json"
OUTPUT_PATH = ROOT / "src" / "data" / "generatedPages.js"
SITE_ORIGIN = "https://timrajahypnotherapy.com"
LOCAL_ASSET_PREFIX = "/archive-assets"

HEADER_NOISE = {
    "Home",
    "EMDR",
    "Pricing & Programs",
    "Hypnotherapy",
    "Personal Development",
    "Unhealthy Habits",
    "Anger Management",
    "Sports Performance",
    "Past Life Regression",
    "Health Related",
    "Insomnia",
    "IBS",
    "Pain Management",
    "Long Covid",
    "Weight Loss",
    "Mental Health",
    "Anxiety",
    "Depression",
    "Eating Disorders",
    "OCD",
    "Fear & Stress",
    "Panic Attacks",
    "PTSD",
    "Phobias",
    "Stress",
    "About Me",
    "Testimonials",
    "Contact",
    "Select Page",
}
FOOTER_MARKERS = {
    "Hypnotherapy",
    "Data Protection GDPR & Confidentiality",
    "Contact Me",
    "The Health Studio’s Booking",
    "The Health Studioâ€™s Booking",
    "Site designed, build and hosted by INIT Digital | © Copyright 2020 Tim Raja",
    "Site designed, build and hosted by INIT Digital | Â© Copyright 2020 Tim Raja",
}
REPLACEMENTS = {
    "â€™": "’",
    "â€˜": "‘",
    "â€œ": "“",
    "â€\x9d": "”",
    "â€“": "–",
    "â€”": "—",
    "â€¦": "…",
    "â€‹": "",
    "Â£": "£",
    "Â ": " ",
    "Â ": " ",
    "Â": "",
    "î’": "",
    "ï€—": "",
    "î‚‹": "",
    "î¦": "",
    "î‚‰": "",
}


def fix_text(text: str) -> str:
    text = text.replace("\u200b", "")
    if any(marker in text for marker in ("â", "Â", "î", "ï")):
        try:
            repaired = text.encode("cp1252").decode("utf-8")
            text = repaired
        except UnicodeError:
            pass
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def slug_from_url(url: str) -> str:
    path = urlparse(url).path.strip("/")
    return path


def local_asset_path(url: str) -> str:
    parsed = urlparse(url)
    return f"{LOCAL_ASSET_PREFIX}{parsed.path}"


def extract_first_image(html_path: Path) -> str:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "html.parser")
    article = soup.select_one("article")
    if not article:
        return ""

    for img in article.find_all("img"):
        candidate = img.get("data-src") or img.get("src")
        if not candidate or candidate.startswith("data:image"):
            continue
        lowered = candidate.lower()
        if any(token in lowered for token in ("icons", "icon-", "logo", "tim_light")):
            continue
        if candidate.startswith(SITE_ORIGIN):
            return local_asset_path(candidate)
    return ""


def clean_lines(text_path: Path, title: str) -> list[str]:
    raw_lines = [line.strip() for line in text_path.read_text(encoding="utf-8").splitlines()]
    raw_lines = [fix_text(line) for line in raw_lines if fix_text(line)]

    start_index = 0
    if "Select Page" in raw_lines:
        start_index = raw_lines.index("Select Page") + 1

    content = raw_lines[start_index:]
    cleaned: list[str] = []

    for line in content:
        if line in FOOTER_MARKERS:
            break
        if line in HEADER_NOISE:
            continue
        if line == title:
            continue
        if not re.search(r"[A-Za-z0-9]", line):
            continue
        cleaned.append(line)

    while cleaned and cleaned[0] in HEADER_NOISE:
        cleaned.pop(0)

    deduped: list[str] = []
    for line in cleaned:
        if deduped and deduped[-1] == line:
            continue
        deduped.append(line)

    return deduped


def build_pages() -> list[dict]:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    pages: list[dict] = []

    for page in manifest["pages"]:
        slug = slug_from_url(page["url"])
        text_path = ROOT / page["text_path"]
        html_path = ROOT / page["html_path"]
        title = fix_text(page["title"].replace(" | Tim Raja Hypnotherapy", ""))
        lines = clean_lines(text_path, title)
        excerpt = ""
        for line in lines:
            if len(line) > 70:
                excerpt = line
                break
        pages.append(
            {
                "slug": slug,
                "url": page["url"],
                "title": title,
                "description": fix_text(page["description"]),
                "image": extract_first_image(html_path),
                "lines": lines,
                "excerpt": excerpt,
            }
        )

    return sorted(pages, key=lambda item: item["slug"])


def main() -> None:
    pages = build_pages()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = "export const generatedPages = " + json.dumps(pages, ensure_ascii=False, indent=2) + ";\n"
    OUTPUT_PATH.write_text(payload, encoding="utf-8")
    print(f"Wrote {len(pages)} pages to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
