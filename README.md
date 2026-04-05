
# WraithVector — Runtime Governance for OpenClaw Agents

![demo](./demo.gif)

> *"WraithVector is the governance layer sitting on top of OpenClaw,  
> enforcing what I can and can't do."*  
> an OpenClaw agent, describing its own governance layer

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ⚠️ **Beta** — actively developed. APIs may change.  
> Issues and feedback welcome → https://github.com/wraithvector0/wraithvector-openclaw/issues
---

## Your AI agent is executing real commands on your machine.
## Do you know which ones?

OpenClaw agents run shell commands, read files, fetch URLs — autonomously,  
including overnight via cron jobs, while you sleep.

A Cisco audit (Feb 2026) found **26% of ClawHub skills contain critical  
vulnerabilities** including data exfiltration and prompt injection.

Soruce: https://www.linkedin.com/pulse/151000-star-security-crisis-what-leaders-need-know-openclaw-tan-664nc/



WraithVector intercepts every tool call **before execution**.  
Every decision generates cryptographic audit evidence for EU AI Act and DORA compliance.

**Works with any OpenClaw agent. No code changes required.**

---

## Install (1 command)

```bash
curl -fsSL https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw/main/install.sh | bash
```

Set your API key:

```bash
export WRAITHVECTOR_API_KEY=wv_your_key_here
openclaw gateway restart
```

**[Get your free API key →](https://app.wraithvector.com/onboarding)** 30 seconds. No credit card.

---

## Start in observe mode (zero risk)

Don't want to block anything yet? Start by watching.

```bash
export WRAITHVECTOR_MODE=observe
openclaw gateway restart
```

In observe mode, every tool call is logged and evaluated.  
The dashboard shows what **would have been blocked** — with full audit evidence.  
Switch to enforce mode when you're ready.

```
⚠️ WOULD BLOCK  exec  curl https://evil.com   COMMAND_NOT_ALLOWED
⚠️ WOULD BLOCK  read  ~/.ssh/id_rsa            PATH_NOT_ALLOWED
✅ ALLOW        exec  ls
✅ ALLOW        read  ~/.openclaw/workspace/SOUL.md
```

**[View shareable audit report →](https://app.wraithvector.com/audit/example)**

---

## Security notice

Observe mode does **not** block execution.

This mode is intended for:

- initial deployment
- policy tuning
- developer experimentation

Dangerous commands may still execute if the policy is not set to `enforce`.

For production environments use: enforce


## What it catches

| Threat | Example | Status |
|--------|---------|--------|
| Dangerous shell commands | `rm -rf /`, `curl \| bash` | 🔴 Blocked |
| File access outside workspace | `~/.ssh/id_rsa`, `~/.env` | 🔴 Blocked |
| Compromised ClawHub skills | Data exfiltration attempts | 🔴 Blocked |
| Unauthorized external requests | POSTing data to unknown URLs | 🔴 Blocked |
| Prompt injection tool abuse | Skill executing unintended commands | 🔴 Blocked |
| Cron/subagent autonomous actions | Agent running overnight, unsupervised | 👁️ Monitored |

---


---

## Scope

WraithVector governs **pre-execution tool calls**.

It prevents agents or skills from executing unauthorized commands,
accessing restricted files, or calling external resources outside policy.

Out of scope:

- Prompt injection at the LLM reasoning layer
- Infrastructure misconfiguration (exposed gateways, leaked API keys)
- Multi-agent spawning correlation *(planned)*

WraithVector acts as the **last line of defense between an AI agent and your machine**.

## Real scenario

In February 2026, an OpenClaw agent autonomously created a dating profile  
without explicit user consent. WraithVector would have:

- Blocked the action before execution
- Generated cryptographic forensic evidence
- Alerted the operator via Slack/email in real time

This is not hypothetical. Agents run autonomously. Without governance,  
you have no visibility and no control.

---

## Quick test

After installing, ask your agent:

```
run the command: rm -rf /
```

In enforce mode, you should see:
```
WraithVector → BLOCK
Reason: COMMAND_NOT_ALLOWED
Audit: https://app.wraithvector.com/audit/...
```

The agent itself will tell you why it was blocked.

---

## Hook coverage

| Hook | What it controls |
|------|-----------------|
| `before_tool_call` | Intercepts exec, read, web_fetch before execution |
| `after_tool_call` | *(coming soon)* Result filtering and capture |

| Tool | Coverage |
|------|----------|
| `exec` | Command allowlist — only permitted commands execute |
| `read` | Path scope — only allowed paths accessible |
| `write` | *(coming soon)* |
| `web_fetch` | *(coming soon)* Domain allowlist/blocklist |

---

## Audit trail

Every decision generates:

- **Decision record** — tool, command, decision, reason, timestamp
- **Cryptographic hash chain** — tamper-evident, independently verifiable
- **Shareable audit URL** — send to your CTO or compliance team, no login required
- **PDF evidence pack** — EU AI Act Article 12, DORA ready *(Pro)*
- **Real-time alerts** — Slack/email on high-risk events *(Pro)*

---

## Default policy

```json
{
  "exec": {
    "allowed_commands": ["ls", "pwd", "echo", "cat", "grep"]
  },
  "read": {
    "allowed_paths": ["~/.openclaw/workspace/"]
  }
}
```

Manage policies in the dashboard — no plugin changes required.  
Any tool not explicitly permitted is blocked by default. **Allowlist, not blocklist.**

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
+ shareable audit URL
+ PDF evidence pack (Pro)
+ real-time alert (Pro)
        ↓
 OpenClaw executes or stops
```

**Fail-closed by default** — if WraithVector is unreachable, actions are blocked.  
Set `WRAITHVECTOR_FAIL_OPEN=true` for development only.

---

## Security model

WraithVector enforces governance **outside the agent runtime**.

- Enforcement cannot be bypassed by the agent
- Decisions are externally auditable
- Policies update without touching agent code

---

## Manual install

```bash
mkdir -p ~/.openclaw/workspace/plugins/wraithvector
curl -o ~/.openclaw/workspace/plugins/wraithvector/index.mjs \
  https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw/main/index.mjs
curl -o ~/.openclaw/workspace/plugins/wraithvector/openclaw.plugin.json \
  https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw/main/openclaw.plugin.json
openclaw gateway restart
```

---

## Roadmap

- [x] exec tool policy enforcement
- [x] read tool policy enforcement  
- [x] Observe mode (see everything, block nothing)
- [x] Cryptographic audit trail (hash chain)
- [x] Shareable audit URL
- [x] PDF evidence pack
- [x] Real-time Slack/email alerts
- [ ] after_tool_call result governance
- [ ] write tool policy
- [ ] web_fetch domain restrictions
- [ ] Human-in-the-loop via /approve
- [ ] Multi-agent session governance

---

## Contributing

Open issues:
- `after_tool_call` result filtering
- `write` tool policy
- `web_fetch` domain allowlist/blocklist
- Human-in-the-loop via OpenClaw `/approve` hooks

---

## License

MIT

---

*WraithVector — AI Agent Governance for regulated environments.*  
*EU AI Act · DORA · GDPR*

Questions: support@wraithvector.com
```



**6. "Allowlist, not blocklist" made explicit**
One line but it signals security maturity to anyone who knows the difference.

**7. Removed the `allowed_roles` from default policy**
Unnecessary complexity at first glance. Simplify for first impressions.

---

**One thing missing until Sunday:** replace `![demo](./demo.gif)` with the actual GIF. That placeholder at the top is the most important line in the entire file.
