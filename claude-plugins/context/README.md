# context

A Claude Code plugin that shows how much of the context window the session is using, in the
status line under the prompt:

```
context 11% (110k / 1000k)
```

The figures are the ones Claude Code gives its own status line: input tokens from the last
response, over the model's context window. Before the first response of a session, and right after
`/compact`, it shows `--`. It updates after every turn.

## Install

In the Claude desktop app: click **+** next to the prompt box, then **Plugins**, **Add marketplace**
with `bencoman/toolshed`, then **Add plugin** and pick `context`.

From a terminal session:

```
/plugin install context --marketplace bencoman/toolshed
```

## Files

- `hooks/register.ts`: sets the status line at session start and whenever the context figures
  change (`session.measure`).
- `tsconfig.json`: for type-checking; it extends the types Claude Code writes into
  `.claude-plugin/types/` once the plugin has loaded.
