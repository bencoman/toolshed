# Toolshed

Small single-page tools that run entirely in the browser, served by GitHub Pages at
**https://bencoman.github.io/toolshed/**. Each tool works by hand as an ordinary web page, and an
agent (Claude, or anything else that can drive a browser) can call it by opening a URL and reading
the result off the page.

## Tools

| Tool | What it does | Example call |
|---|---|---|
| [domain-check](https://bencoman.github.io/toolshed/domain-check/) | Domain-name availability from the registry (RDAP), cross-checked with DNS | [`domain-check/?q=mathforge,numberly&tld=com,com.au,au`](https://bencoman.github.io/toolshed/domain-check/?q=mathforge,numberly&tld=com,com.au,au) |

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
`domain-check` is the reference implementation.

### Files

- One folder per tool, named in kebab-case: `/<tool>/index.html`. The folder name is the tool's id
  everywhere: URL, report header, `window.toolshed.tool`, storage keys.
- One self-contained HTML file: CSS and JS inline, no build step, no backend. A library may load from
  a CDN only at a pinned exact version.
- No assets shared between tools, so any tool can be copied out and used on its own.
- Each page links back to the index (`../`) and has a "Call it from a URL" section listing its
  params, status words and limits.

### Inputs

- All inputs come from the query string. `q` holds the main list of items. Other params are
  lowercase and named for what they hold (`tld`, `from`, `limit`).
- Lists are comma separated. Ignore whitespace and empty entries, and drop duplicates.
- With the required params present, run once on load. Never re-run on a timer or on focus.
- Cap the work per run and state the cap on the page, so a run finishes in about a minute. A
  truncated run says so on its summary line.

### Output: the report block

A `<pre id="report" data-state="…">` holds the result as plain text:

```
DOMAIN-CHECK  DONE  6/6  2026-10-16 22:10 UTC
available 2 · taken 3 · needs a look 1 · unknown 0

mathforge.com     TAKEN         registrar Example Registrar, Inc. · since 2011-05-02 · expires 2027-05-02
mathforge.com.au  AVAILABLE     Not in registry (RDAP 404) · DNS NXDOMAIN
```
<sub>(Illustrative output.)</sub>

- **Line 1, the header:** `<TOOL-ID in capitals>  <STATE>  <done>/<total>  <start time, UTC>`, with
  two spaces between fields. `STATE` is one of `IDLE`, `RUNNING`, `DONE`, `CANCELLED`, `ERROR`.
- **Line 2, the summary:** one line of counts or totals. For `ERROR` it reads
  `error: <what went wrong and how to fix the input>`.
- **Line 3** is blank, then **one line per item:** `<key>  <STATUS>  <detail>`. Pad the key to a
  common width. `STATUS` is a single capitalised word (hyphens allowed, e.g. `LIKELY-FREE`) from a
  vocabulary the tool documents. Detail is free text.
- Every item ends with a final status. Nothing is left pending: an item that failed gets `UNKNOWN`
  or `ERROR` with the reason in its detail.
- `data-state` on `#report` is `STATE` in lowercase.
- `document.title` shows progress: `3/6 · <Tool name>` while running, `Done · <Tool name>` when
  finished.

### Output: `window.toolshed`

The same result as an object, kept up to date as the run progresses:

```js
window.toolshed = {
  tool: "domain-check",
  version: 1,              // bump when the output shape changes
  state: "done",           // idle | running | done | cancelled | error
  done: 6,
  total: 6,
  startedAt: "2026-10-16T22:10:04Z",
  summary: "available 2 · taken 3 · needs a look 1 · unknown 0",
  error: null,             // message when state is "error"
  results: [
    { key: "mathforge.com", status: "TAKEN", detail: "…" /*, tool-specific fields */ }
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

## Adding a tool

1. Create `/<tool>/index.html` following the convention.
2. Add a row to the Tools table above and to the list in `index.html`.
3. Push to `main`. Pages redeploys in a minute or two.
4. Make one URL call and read the report back before relying on it.

## Hosting

GitHub Pages, deployed from `main`, folder `/`. The empty `.nojekyll` file turns off Jekyll so every
file is served exactly as committed.
