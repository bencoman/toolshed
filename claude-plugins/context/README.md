# context

A Claude Code plugin that shows how much of the context window the session is using, in the
status line under the prompt:

```
context 11% (110k / 1000k)
```

The figures are the ones Claude Code gives its own status line: input tokens from the last
response, over the model's context window. It updates after every turn.

In the desktop app a new session has no line until you send the first prompt, because plugins load
only then. After `/clear` the line is blank until the first turn ends.

## Install

In the Claude desktop app:

1. Click **+** next to the prompt box, then **Plugins**.
2. Click **Manage plugins**.
3. Click **Add**, then **Add marketplace**.
4. Click **Add from a repository**.
5. Enter `bencoman/toolshed` and click **Sync**.
6. Pick **Context** and click **Add to this computer**.

It takes effect at once, in open sessions too.

From a terminal session:

```
/plugin install context --marketplace bencoman/toolshed
```

## Files

- `hooks/register.ts`: sets the status line at session start and whenever the context figures
  change (`session.measure`).
- `tsconfig.json`: for type-checking; it extends the types Claude Code writes into
  `.claude-plugin/types/` once the plugin has loaded.
