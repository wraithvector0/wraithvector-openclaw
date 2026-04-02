# WraithVector Governance Plugin for OpenClaw

![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-plugin-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![EU AI Act](https://img.shields.io/badge/EU%20AI%20Act-compliant-purple)

> **A Cisco audit (Feb 2026) found that 26% of ClawHub skills contain critical vulnerabilities including data exfiltration and prompt injection.** WraithVector intercepts every tool call before execution and generates cryptographic forensic evidence of every decision.

Prevent dangerous agent actions and generate verifiable audit logs for every OpenClaw tool call.

**Get your free API key → [app.wraithvector.com/onboarding](https://app.wraithvector.com/onboarding)**

---

## Install (1 command)

```bash
curl -fsSL https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main/install.sh | bash
```

Then set your API key:

```bash
export WRAITHVECTOR_API_KEY=wv_your_key_here
openclaw gateway restart
```

Get your free key at **[app.wraithvector.com/onboarding](https://app.wraithvector.com/onboarding)** — 30 seconds, no credit card.

---

## Threats blocked

- Unauthorized shell commands (`rm -rf`, `curl | bash`, data exfiltration)
- Sensitive path access outside allowed workspace
- Prompt injection attempts via tool calls
- Agent tool misuse and scope creep
- Unauthorized actions by compromised ClawHub skills

---

## Demo

```
agent → run the command: rm -rf /

WraithVector → BLOCK
Reason:        COMMAND_NOT_ALLOWED
Evidence:      cryptographic hash chain record
PDF:           https://app.wraithvector.com/api/audit/pdf?id=...
```

```
agent → run the command: ls

WraithVector → ALLOW
Reason:        COMMAND_IN_POLICY
Evidence:      cryptographic hash chain record
```

---

## What it does

Every tool call your OpenClaw agent makes is evaluated by WraithVector **before execution**:

| Hook | What it controls |
|------|-----------------|
| `exec` | Command scope — only allowed commands execute |
| `read` | Path scope — only allowed paths are accessible |
| `write` | *(coming soon)* File write restrictions |
| `web_fetch` | *(coming soon)* Domain allowlist/blocklist |

Every ALLOW and BLOCK decision generates a **cryptographic audit trail** — independently verifiable, EU AI Act and DORA compliant.

---

## Why this matters

In February 2026, an OpenClaw agent autonomously created a MoltMatch dating profile without explicit user consent. WraithVector would have:

- **Blocked** the action before execution
- **Generated forensic evidence** of the attempt with a cryptographic hash chain
- **Alerted** the operator via Slack/email in real time

This is not hypothetical. OpenClaw agents execute real actions — shell commands, file reads, web requests — on your machine. Without governance, you have no visibility and no control.

---

## Architecture

```
OpenClaw agent tool call
         ↓
  before_tool_call hook
         ↓
  WraithVector API (policy evaluation)
         ↓
     ALLOW / BLOCK
         ↓
   + cryptographic audit record
   + PDF evidence pack
   + real-time alert (optional)
         ↓
  OpenClaw executes or stops
```

**Fail-closed by default** — if WraithVector is unreachable, actions are blocked to protect your system.
Set `WRAITHVECTOR_FAIL_OPEN=true` to allow actions when offline (development only).

---

## Default policy

Out of the box, WraithVector ships with a safe default policy:

```json
{
  "exec": {
    "allowed_roles": ["*"],
    "allowed_commands": ["ls", "pwd", "echo", "cat", "grep"]
  },
  "read": {
    "allowed_roles": ["*"],
    "allowed_paths": ["~/.openclaw/workspace/"]
  }
}
```

Customize your policy from your dashboard at `app.wraithvector.com`.

---

## What you get in the audit trail

Every decision generates:

- **Decision record** — tool name, command, decision (ALLOW/BLOCK), reason, timestamp
- **Cryptographic hash chain** — tamper-evident, independently verifiable
- **PDF evidence pack** — ready for compliance audits (EU AI Act Article 12, DORA)
- **Real-time alerts** — Slack and email on high-risk events

---

## Manual install (alternative)

```bash
mkdir -p ~/.openclaw/workspace/plugins/wraithvector
curl -o ~/.openclaw/workspace/plugins/wraithvector/index.mjs \
  https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main/index.mjs
curl -o ~/.openclaw/workspace/plugins/wraithvector/openclaw.plugin.json \
  https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main/openclaw.plugin.json
openclaw gateway restart
```

---

## Roadmap

- [x] `exec` tool policy enforcement
- [x] `read` tool policy enforcement
- [x] Cryptographic audit trail (hash chain)
- [x] PDF evidence pack generation
- [x] Real-time Slack/email alerts
- [ ] `write` tool policy
- [ ] `web_fetch` domain restrictions
- [ ] `after_tool_call` result governance
- [ ] Human-in-the-loop via `/approve` (OpenClaw async hooks)
- [ ] Multi-agent session governance

---

## Contributing

Contributions welcome. Open issues:

- Add `write` tool policy
- Add `web_fetch` domain allowlist/blocklist
- Human-in-the-loop integration via OpenClaw async hooks (`/approve`)
- `after_tool_call` result filtering

---

## License

MIT

---

*WraithVector — AI Agent Governance for regulated environments.*
*EU AI Act · DORA · GDPR*

Questions: support@wraithvector.com
