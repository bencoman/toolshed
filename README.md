# Toolshed

Small single-page tools that run entirely in the browser, served by GitHub Pages at
**https://bencoman.github.io/toolshed/**. Each tool works by hand as an ordinary web page, and an
agent (Claude, or anything else that can drive a browser) can call it by opening a URL and reading
the result off the page.

## Tools

| Tool | What it does | Live page |
|---|---|---|
| [domain-check](domain-check/) | Domain-name availability from the registry (RDAP), cross-checked with DNS | [open](https://bencoman.github.io/toolshed/domain-check/) |

Each tool's README lists its params, status words, result fields and limits.

## Calling a tool

1. Open `https://bencoman.github.io/toolshed/<tool>/?<params>`. When the required params are in the
   URL, the tool runs once on load.
2. Wait for the run to finish: `#report` gets `data-state="done"` (or `error` / `cancelled`), and the
   first line of the report block changes from `RUNNING` to the same word. Check every few seconds;
   a run is designed to finish within about a minute.
3. Read the result in either form:
   - the text of `<pre id="report">`, which plain page-text reading picks up; or
   - `window.toolshed`, the same result as JSON, when you can run script in the page.

Opened without params, a tool is an ordinary form and shows the last run made in that browser.

## The convention

Every tool here follows the rules below, so a new tool can be called the moment it is pushed.
[domain-check](domain-check/) is the reference implementation, and its README shows a real report.

### Files

- One folder per tool, named in kebab-case. The folder name is the tool's id everywhere: URL,
  report header, `window.toolshed.tool`, storage keys.
- `/<tool>/index.html` is the tool: one self-contained HTML file, CSS and JS inline, no build step,
  no backend. A library may load from a CDN only at a pinned exact version.
- `/<tool>/README.md` is the tool's reference (see [Tool README](#tool-readme)).
- No assets shared between tools, so any tool can be copied out and used on its own.
- Each page links back to the index (`../`) and has a short "Call it from a URL" section giving its
  params and status words.

### Inputs

- All inputs come from the query string. `q` holds the main list of items. Other params are
  lowercase and named for what they hold (`from`, `limit`, `format`).
- Lists are comma separated. Ignore whitespace and empty entries, and drop duplicates.
- With the required params present, run once on load. Never re-run on a timer or on focus.
- Cap the work per run and state the cap in the README, so a run finishes in about a minute. A
  truncated run says so on its summary line.

### Output: the report block

A `<pre id="report" data-state="…">` holds the result as plain text in this shape:

```
<TOOL-ID>  <STATE>  <done>/<total>  <YYYY-MM-DD HH:MM> UTC
<summary>

<key>  <STATUS>  <detail>
<key>  <STATUS>  <detail>
```

- **Line 1, the header:** the tool id in capitals, the run state, progress, and the start time in
  UTC, with two spaces between fields. `STATE` is one of `IDLE`, `RUNNING`, `DONE`, `CANCELLED`,
  `ERROR`.
- **Line 2, the summary:** one line of counts or totals. For `ERROR` it reads
  `error: <what went wrong and how to fix the input>`.
- **Line 3** is blank, then **one line per item.** Pad the key to a common width. `STATUS` is a
  single capitalised word (hyphens allowed, e.g. `NOT-FOUND`) from the vocabulary in the tool's
  README. Detail is free text.
- Every item ends with a final status. Nothing is left pending: an item that failed gets `UNKNOWN`
  or `ERROR` with the reason in its detail.
- `data-state` on `#report` is `STATE` in lowercase.
- `document.title` shows progress: `3/6 · <Tool name>` while running, `Done · <Tool name>` when
  finished.

### Output: `window.toolshed`

The same result as an object, kept up to date as the run progresses:

```js
window.toolshed = {
  tool: "<tool-id>",
  version: 1,              // bump when the output shape changes
  state: "done",           // idle | running | done | cancelled | error
  done: 3,
  total: 3,
  startedAt: "2026-10-16T22:10:04Z",
  summary: "<summary line>",
  error: null,             // message when state is "error"
  results: [
    { key: "<key>", status: "<STATUS>", detail: "<detail>" /*, tool-specific fields */ }
  ]
};
```

### Behaviour

- **Browser-side only.** Call public APIs that allow cross-origin requests (CORS). When one refuses,
  fall back to another source or report the item as `UNKNOWN`. Never hang.
- **No secrets.** The repo and the pages are public: no API keys, tokens or personal data in the
  code, in URLs, or in the output.
- **Be polite to the APIs.** Throttle per host, keep concurrency small, honour published rate limits.
- **Browser storage for conveniences only** (last inputs, last run, caches). Every tool shares the
  `bencoman.github.io` origin, so prefix keys with `toolshed:<tool>:` and wrap each access in
  `try`/`catch`.
- **Accessible and responsive.** The page works at phone width and in light and dark mode.

### Tool README

Each `/<tool>/README.md` has these sections, in this order:

1. **What it does:** one paragraph, plus the live link.
2. **Call:** an example URL and a table of params (name, required, meaning, default).
3. **Statuses:** every `STATUS` word and what it means, plus how the summary line is counted.
4. **Result fields:** the tool-specific fields in each `window.toolshed.results[]` entry.
5. **Example:** a real report from a test call, with the URL that produced it.
6. **Sources and limits:** the APIs it calls, caps and rate limits, and known gaps.

The page's "Call it from a URL" section is the short form of sections 2 and 3, for whoever lands on
the page. The README is the full reference; keep the two in step.

## Adding a tool

1. Create `/<tool>/index.html` and `/<tool>/README.md` following the convention.
2. Add a row to the Tools table above and to the list in `index.html`.
3. Push to `main`. Pages redeploys in a minute or two.
4. Make one URL call and paste its report into the README's Example section.

## Hosting

GitHub Pages, deployed from `main`, folder `/`. The empty `.nojekyll` file turns off Jekyll so every
file is served exactly as committed. READMEs are for reading on GitHub; the pages are the tools.
