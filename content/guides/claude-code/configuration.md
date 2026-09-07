---
title: settings and memory
description: where claude code instructions and settings belong, how precedence works, and how to inspect the result.
products: [claude-code]
updatedAt: "2026-09-07T16:33:00-04:00"
checkedAt: "2026-09-07T15:02:34-04:00"
status: current
completion: complete
evidence: [official-source, analysis, open-question]
sources: [anthropic-settings, anthropic-memory, anthropic-permissions, anthropic-commands]
redirects: []
voice: evidence
navigation:
  scope: claude-code
  order: 30
---

<span id="put-each-setting-where-it-belongs" class="heading-alias" aria-hidden="true"></span>

## where does this setting go?

[`CLAUDE.md`](https://code.claude.com/docs/en/memory) supplies instructions for
the model. [settings files](https://code.claude.com/docs/en/settings) select
runtime behavior. start by identifying which of those you are changing and who
the change should affect.

| location | use it for |
| --- | --- |
| `~/.claude/settings.json` | personal settings across projects |
| `.claude/settings.json` | settings shared with the repository |
| `.claude/settings.local.json` | personal overrides for this project |
| organization managed settings | policy administered for the organization |
| `CLAUDE.md` and `.claude/rules/` | repository knowledge and working instructions |

keep local paths and account details out of shared examples. a teammate should
be able to understand a project setting without also inheriting your machine.

<span id="settings-precedence" class="heading-alias" aria-hidden="true"></span>

### which setting wins?

Anthropic documents this order for conflicting settings, highest first:
managed settings, command line options, project local settings, shared project
settings, then user settings. merging has field specific behavior; permission
and hook lists deserve a look at the reference when more than one layer sets
them.

if a setting seems ignored, inspect its scope before adding another override.
a local copy can hide a project change, and a managed value can constrain every
local choice. use `/config` to inspect settings, `/permissions` for tool rules,
and `claude doctor` for configuration diagnostics.

<span id="keep-instructions-and-memory-legible" class="heading-alias" aria-hidden="true"></span>

## why am i repeating myself?

<span id="shared-rules-can-have-one-source" class="heading-alias" aria-hidden="true"></span>

### one set of project rules

Claude supports imports in `CLAUDE.md`. a repository with shared agent guidance
can use:

```markdown
@AGENTS.md

Use .claude/skills/ for workflows specific to Claude Code.
```

the import resolves relative to the containing file. use it when `AGENTS.md`
actually contains shared guidance. keep tool specific differences explicit
instead of maintaining two slightly different copies of the same rule.

rules under `.claude/rules/` can scope instructions to matching paths. that is
useful for a repository where a frontend package and a data pipeline need
different checks. a rule should lead to the real command or convention that
contributors maintain.

<span id="memory-can-become-stale" class="heading-alias" aria-hidden="true"></span>

### is that memory still right?

auto memory holds notes Claude saves from work. inspect a remembered command
before treating it as the current way to run the project. repository files,
current tool output, and a dated decision can resolve a stale note.

keep the author of a note clear too. an agent’s summary of a preference is a
claim to check against what the person actually said. that distinction matters
when memory starts shaping later work.

<span id="make-one-permission-change-you-can-explain" class="heading-alias" aria-hidden="true"></span>

## can it stop asking to run this?

[permission rules](https://code.claude.com/docs/en/permissions) can allow, ask
about, or deny tool calls. permission modes select the session’s wider approval
behavior. exact command rules are useful for a familiar check; broad shell
rules cover much more activity.

for a project with Node tests in `label.test.mjs`, this setting allows that
specific test command. the [extensions example](/guides/claude-code/extensions/#a-project-to-try-this-in)
provides a small fixture:

```json
{
  "permissions": {
    "allow": ["Bash(node --test label.test.mjs)"]
  }
}
```

review the script or test being allowed first. the same command text can run
different code after its files change. this example establishes one convenient
operation; it is an illustration of scope, with no claim to be a complete
security policy.

<span id="inspect-the-environment-that-will-execute" class="heading-alias" aria-hidden="true"></span>

## which machine is using these settings?

a local terminal and a cloud task can read different configuration. verify the
host, working directory, active account, and available tools in the environment
where work will run. keep credential values in the authentication mechanism
that needs them, outside prompts and shared Markdown.

a useful configuration change has a short explanation: which file changed,
which sessions it affects, and how you confirmed the resulting behavior.
make that explanation part of the review while the change is still small.
