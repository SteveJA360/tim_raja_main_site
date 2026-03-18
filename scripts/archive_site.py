from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse, urlunparse
import xml.etree.ElementTree as ET

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://timrajahypnotherapy.com/"
BASE_HOST = urlparse(BASE_URL).netloc.lower()
ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_DIR = ROOT / "archive"
RAW_DIR = ARCHIVE_DIR / "raw"
PAGES_DIR = RAW_DIR / "pages"
TEXT_DIR = RAW_DIR / "text"
MEDIA_JSON_DIR = RAW_DIR / "wp-media"
ASSETS_DIR = ARCHIVE_DIR / "assets"
MANIFEST_PATH = ARCHIVE_DIR / "manifest.json"
TIMEOUT = 30
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

ASSET_EXTENSIONS = {
    ".avif",
    ".css",
    ".eot",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".json",
    ".mp4",
    ".otf",
    ".pdf",
    ".png",
    ".svg",
    ".ttf",
    ".txt",
    ".webm",
    ".webp",
    ".woff",
    ".woff2",
    ".xml",
}
PAGE_EXCLUDE_PREFIXES = (
    "/wp-admin",
    "/wp-json",
    "/xmlrpc.php",
)
STYLE_URL_RE = re.compile(r"url\((['\"]?)(.*?)\1\)")


session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT})


def ensure_dirs() -> None:
    for directory in (ARCHIVE_DIR, RAW_DIR, PAGES_DIR, TEXT_DIR, MEDIA_JSON_DIR, ASSETS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def canonicalize_url(url: str, *, keep_query: bool = False) -> str | None:
    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        return None
    if not parsed.netloc:
        return None

    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    if not path:
        path = "/"

    query = parsed.query if keep_query else ""
    scheme = "https" if parsed.netloc.lower() == BASE_HOST else parsed.scheme
    clean = parsed._replace(scheme=scheme, path=path, query=query, fragment="")
    return urlunparse(clean)


def same_host(url: str) -> bool:
    return urlparse(url).netloc.lower() == BASE_HOST


def asset_extension(url: str) -> str:
    return Path(urlparse(url).path).suffix.lower()


def is_asset_url(url: str) -> bool:
    parsed = urlparse(url)
    path = parsed.path.lower()
    if path.startswith("/wp-content/uploads/"):
        return True
    if path.startswith("/wp-content/themes/"):
        return True
    if path.startswith("/wp-includes/"):
        return True
    return asset_extension(url) in ASSET_EXTENSIONS


def is_page_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    if parsed.netloc.lower() != BASE_HOST:
        return False
    if any(parsed.path.startswith(prefix) for prefix in PAGE_EXCLUDE_PREFIXES):
        return False
    if parsed.path.endswith("/feed/") or parsed.path == "/feed/":
        return False
    if is_asset_url(url):
        return False
    return True


def fetch_text(url: str) -> str:
    response = session.get(url, timeout=TIMEOUT)
    response.raise_for_status()
    return response.text


def fetch_sitemap_urls() -> list[str]:
    sitemap_index = fetch_text(urljoin(BASE_URL, "wp-sitemap.xml"))
    root = ET.fromstring(sitemap_index)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = [node.text.strip() for node in root.findall(".//sm:loc", ns) if node.text]

    page_urls: set[str] = set()
    for sitemap_url in sitemap_urls:
        sitemap_body = fetch_text(sitemap_url)
        sitemap_root = ET.fromstring(sitemap_body)
        for node in sitemap_root.findall(".//sm:loc", ns):
            if not node.text:
                continue
            clean = canonicalize_url(node.text)
            if clean:
                page_urls.add(clean)

    page_urls.add(canonicalize_url(BASE_URL) or BASE_URL)
    return sorted(page_urls)


def parse_srcset(value: str) -> Iterable[str]:
    for item in value.split(","):
        candidate = item.strip().split(" ")[0].strip()
        if candidate:
            yield candidate


def extract_urls_from_html(page_url: str, soup: BeautifulSoup) -> tuple[set[str], set[str]]:
    page_links: set[str] = set()
    asset_links: set[str] = set()

    for tag, attr in (
        ("a", "href"),
        ("img", "src"),
        ("script", "src"),
        ("link", "href"),
        ("source", "src"),
        ("video", "src"),
    ):
        for node in soup.find_all(tag):
            value = node.get(attr)
            if not value:
                continue
            resolved = canonicalize_url(urljoin(page_url, value))
            if not resolved:
                continue
            if is_asset_url(resolved):
                asset_links.add(resolved)
            elif is_page_url(resolved):
                page_links.add(resolved)

    for node in soup.find_all(["img", "source"]):
        value = node.get("srcset")
        if not value:
            continue
        for candidate in parse_srcset(value):
            resolved = canonicalize_url(urljoin(page_url, candidate))
            if resolved and same_host(resolved):
                asset_links.add(resolved)

    for meta in soup.find_all("meta"):
        value = meta.get("content")
        if not value:
            continue
        if meta.get("property") in {"og:image", "twitter:image"}:
            resolved = canonicalize_url(urljoin(page_url, value))
            if resolved and same_host(resolved):
                asset_links.add(resolved)

    for node in soup.find_all(style=True):
        for _, match in STYLE_URL_RE.findall(node["style"]):
            resolved = canonicalize_url(urljoin(page_url, match))
            if resolved and same_host(resolved):
                asset_links.add(resolved)

    for style_tag in soup.find_all("style"):
        css_text = style_tag.get_text(" ", strip=True)
        for _, match in STYLE_URL_RE.findall(css_text):
            resolved = canonicalize_url(urljoin(page_url, match))
            if resolved and same_host(resolved):
                asset_links.add(resolved)

    return page_links, asset_links


def page_output_dir(url: str) -> Path:
    parts = [part for part in urlparse(url).path.strip("/").split("/") if part]
    if not parts:
        return PAGES_DIR / "home"
    return PAGES_DIR.joinpath(*parts)


def text_output_path(url: str) -> Path:
    parts = [part for part in urlparse(url).path.strip("/").split("/") if part]
    if not parts:
        return TEXT_DIR / "home.txt"
    return TEXT_DIR / (parts[-1] + ".txt")


def clean_text(soup: BeautifulSoup) -> str:
    clone = BeautifulSoup(str(soup), "html.parser")
    for tag in clone(["script", "style", "noscript", "svg"]):
        tag.decompose()
    text = clone.get_text("\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def archive_pages(seed_urls: list[str]) -> tuple[list[dict], set[str]]:
    queue = list(seed_urls)
    seen: set[str] = set()
    manifest_pages: list[dict] = []
    asset_urls: set[str] = set()

    while queue:
        page_url = queue.pop(0)
        if page_url in seen:
            continue
        seen.add(page_url)

        response = session.get(page_url, timeout=TIMEOUT)
        response.raise_for_status()
        html = response.text

        page_dir = page_output_dir(page_url)
        page_dir.mkdir(parents=True, exist_ok=True)
        html_path = page_dir / "index.html"
        html_path.write_text(html, encoding="utf-8")

        soup = BeautifulSoup(html, "html.parser")
        title = soup.title.get_text(strip=True) if soup.title else ""
        description_tag = soup.find("meta", attrs={"name": "description"})
        description = description_tag.get("content", "").strip() if description_tag else ""

        text_path = text_output_path(page_url)
        text_path.parent.mkdir(parents=True, exist_ok=True)
        text_path.write_text(clean_text(soup), encoding="utf-8")

        page_links, page_assets = extract_urls_from_html(page_url, soup)
        asset_urls.update(page_assets)
        for link in sorted(page_links):
            if link not in seen and link not in queue:
                queue.append(link)

        manifest_pages.append(
            {
                "url": page_url,
                "title": title,
                "description": description,
                "html_path": str(html_path.relative_to(ROOT)).replace("\\", "/"),
                "text_path": str(text_path.relative_to(ROOT)).replace("\\", "/"),
            }
        )

    return manifest_pages, asset_urls


def collect_media_assets() -> tuple[list[dict], set[str]]:
    page = 1
    total_pages = 1
    manifest_media: list[dict] = []
    asset_urls: set[str] = set()

    while page <= total_pages:
        response = session.get(
            urljoin(BASE_URL, "wp-json/wp/v2/media"),
            params={"per_page": 100, "page": page},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        total_pages = int(response.headers.get("X-WP-TotalPages", "1"))
        payload = response.json()

        json_path = MEDIA_JSON_DIR / f"page-{page}.json"
        json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

        for item in payload:
            source_url = item.get("source_url")
            if source_url:
                clean = canonicalize_url(source_url)
                if clean and same_host(clean):
                    asset_urls.add(clean)

            sizes = (item.get("media_details") or {}).get("sizes") or {}
            for size in sizes.values():
                candidate = size.get("source_url")
                if not candidate:
                    continue
                clean = canonicalize_url(candidate)
                if clean and same_host(clean):
                    asset_urls.add(clean)

            manifest_media.append(
                {
                    "id": item.get("id"),
                    "slug": item.get("slug"),
                    "title": (item.get("title") or {}).get("rendered", ""),
                    "source_url": item.get("source_url"),
                    "mime_type": item.get("mime_type"),
                }
            )

        page += 1

    return manifest_media, asset_urls


def asset_output_path(asset_url: str) -> Path:
    parsed = urlparse(asset_url)
    relative_path = parsed.path.lstrip("/")
    if not relative_path:
        relative_path = "root"
    return ASSETS_DIR / relative_path


def download_assets(asset_urls: Iterable[str]) -> tuple[list[str], list[dict]]:
    downloaded: list[str] = []
    failures: list[dict] = []

    for asset_url in sorted(set(asset_urls)):
        target = asset_output_path(asset_url)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            downloaded.append(str(target.relative_to(ROOT)).replace("\\", "/"))
            continue

        try:
            response = session.get(asset_url, timeout=TIMEOUT)
            response.raise_for_status()
            target.write_bytes(response.content)
            downloaded.append(str(target.relative_to(ROOT)).replace("\\", "/"))
        except Exception as exc:  # noqa: BLE001
            failures.append({"url": asset_url, "error": str(exc)})

    return downloaded, failures


def write_manifest(pages: list[dict], media: list[dict], downloaded_assets: list[str], failures: list[dict]) -> None:
    manifest = {
        "base_url": BASE_URL,
        "page_count": len(pages),
        "media_count": len(media),
        "asset_file_count": len(downloaded_assets),
        "pages": sorted(pages, key=lambda item: item["url"]),
        "media": sorted(media, key=lambda item: item["id"] or 0),
        "downloaded_assets": downloaded_assets,
        "failures": failures,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    ensure_dirs()
    sitemap_urls = fetch_sitemap_urls()
    pages, page_assets = archive_pages(sitemap_urls)
    media, media_assets = collect_media_assets()
    downloaded_assets, failures = download_assets(page_assets | media_assets)
    write_manifest(pages, media, downloaded_assets, failures)
    print(
        json.dumps(
            {
                "pages": len(pages),
                "media": len(media),
                "assets": len(downloaded_assets),
                "failures": len(failures),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
