![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-plugin-blue)

# WraithVector Governance Plugin for OpenClaw

Runtime enforcement and cryptographic audit trail for OpenClaw agents.

> Early access. Request an API key: wraithvector0@gmail.com

## What it does

Every tool call made by your OpenClaw agent is evaluated by WraithVector before execution:

- `exec` — command scope control (only allowed commands execute)
- `read` — path scope control (only allowed paths are accessible)
- Every decision generates a cryptographic audit trail (EU AI Act / DORA compliant)

## Architecture
```
Agent tool call
      ↓
before_tool_call hook
      ↓
WraithVector governance API
      ↓
ALLOW / BLOCK
      ↓
OpenClaw executes or stops
```

## Example policy
```json
{
  "exec": {
    "allowed_roles": ["*"],
    "allowed_commands": ["ls", "pwd", "echo"]
  },
  "read": {
    "allowed_roles": ["*"],
    "allowed_paths": ["~/.openclaw/workspace/"]
  }
}
```

## Why this matters

In February 2026, an OpenClaw agent created a MoltMatch dating profile without explicit user consent. WraithVector would have blocked it and generated forensic evidence of the attempt.

## Install
```bash
mkdir -p ~/.openclaw/workspace/plugins/wraithvector
curl -o ~/.openclaw/workspace/plugins/wraithvector/index.mjs https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main/index.mjs
curl -o ~/.openclaw/workspace/plugins/wraithvector/openclaw.plugin.json https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main/openclaw.plugin.json
openclaw gateway restart
```

## Test ALLOW
```
run the command: ls
```

## Test BLOCK
```
run the command: rm -rf test
```

## Contributing

Contributions welcome. Open issues:

- Add `write` tool policy
- Add `web_fetch` domain restrictions
- Improve policy engine

## License

MIT
