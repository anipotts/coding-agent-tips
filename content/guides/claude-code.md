---
title: claude code
description: a practical map of claude code across terminal, desktop, editor, web, and remote workflows.
products: [claude-code]
updatedAt: "2026-09-07T15:02:34-04:00"
checkedAt: "2026-09-07T15:02:34-04:00"
status: current
completion: complete
evidence: [official-source, analysis, open-question]
sources: [anthropic-claude-overview, anthropic-how-claude-code-works, anthropic-platforms, anthropic-desktop, anthropic-web, anthropic-remote-control, anthropic-features-overview, anthropic-subagents, anthropic-permissions, anthropic-sandboxing, anthropic-cowork]
redirects: []
voice: personal
navigation:
  scope: claude-code
  order: 10
---

## this is claude code

[Claude Code](https://code.claude.com/docs/en/overview) is Anthropic’s coding
agent. it can inspect a repository, change files, run commands, and use the
results to decide what to do next. you can work through a terminal, supported
editor, desktop app, or web session.

<div class="surface-bento">
  <figure><a href="https://code.claude.com/docs/en/overview"><img src="/media/publications/claude-code-1200.webp" srcset="/media/publications/claude-code-640.webp 640w, /media/publications/claude-code-1200.webp 1200w" sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 72rem) calc((100vw - 20rem) / 2), 32rem" alt="Claude Code working in its coding interface" loading="eager" fetchpriority="high" decoding="async" width="1200" height="728" /><figcaption>code and repository work</figcaption></a></figure>
  <figure><a href="https://code.claude.com/docs/en/desktop"><img src="/media/publications/claude-cowork-1200.webp" srcset="/media/publications/claude-cowork-640.webp 640w, /media/publications/claude-cowork-1200.webp 1200w" sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 72rem) calc((100vw - 20rem) / 2), 32rem" alt="the Claude Cowork task interface" loading="lazy" decoding="async" width="1200" height="842" /><figcaption>desktop tasks and visual review</figcaption></a></figure>
  <figure><a href="https://code.claude.com/docs/en/remote-control"><img src="/media/publications/claude-chat-1200.webp" srcset="/media/publications/claude-chat-640.webp 640w, /media/publications/claude-chat-1200.webp 1200w" sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 72rem) calc((100vw - 20rem) / 2), 32rem" alt="Claude available through a remote conversation surface" loading="lazy" decoding="async" width="1200" height="728" /><figcaption>web and remote control</figcaption></a></figure>
</div>

ironically, Anthropic's Claude Code feels the least personified to me out of
Claude Code, Codex, and Grok Bot. the agents i've seen tend to have names
describing their jobs: reviewer, infra engineer, things like that. Claude
Code supports [named agents](https://code.claude.com/docs/en/sub-agents);
the role focused presentation is what stands out in my own use.

### one request can become several rounds of work

Anthropic describes an [agent loop](https://code.claude.com/docs/en/how-claude-code-works)
that gathers context, acts, and checks the result. the model chooses an action;
the harness supplies tools, manages context, and returns what happened. a
failed test becomes useful information for the next attempt.

for example, “fix the empty search result” might involve finding the search
handler, reproducing the failure, changing the code, and running the relevant
test. those steps can all follow from one prompt. the finish line still needs
to be concrete: an empty result should render a useful message, and an ordinary
search should keep working.

## choose where the work runs

### terminal, editor, and desktop

the [terminal and editor integrations](https://code.claude.com/docs/en/platforms)
keep Claude close to an existing development environment. selected code and
editor diagnostics can help locate a problem; shell output and the final diff
show what happened after it was located.

the [desktop app](https://code.claude.com/docs/en/desktop) adds a visual place
for sessions, diffs, previews, and parallel work. a worktree gives a session
its own checkout. two sessions that own different worktrees can still produce
conflicting changes when their branches are combined, so file ownership and a
final integration pass matter.

choose the interface that makes your next decision easy to inspect. a CSS
change needs a rendered page; a parser change needs representative inputs and
outputs. either can also need a code review.

### web and Remote Control

[web sessions](https://code.claude.com/docs/en/claude-code-on-the-web), currently
a research preview, run in a cloud environment. [Remote Control](https://code.claude.com/docs/en/remote-control)
lets a browser or phone steer Claude Code running on your machine. local tools,
files, and configuration stay with that machine, and the local process needs
to remain available for work to continue there.

picture a bug that only reproduces with your local development database. Remote
Control can let you check on that investigation from your phone. a cloud task
needs its own reproducible environment and access to the relevant data. choose
the execution environment before choosing the screen you want to use.

## understand what shapes the loop

Claude Code’s [extension system](https://code.claude.com/docs/en/features-overview)
gives different jobs to instructions, skills, tools, and events:

| the task needs | the relevant piece |
| --- | --- |
| repository conventions and durable context | `CLAUDE.md` and scoped rules |
| a repeatable procedure | a skill |
| access to an external system | MCP tools and resources |
| a separate investigation | a subagent with a defined task |
| code to run at a lifecycle event | a hook |
| related extensions to travel together | a plugin |

these pieces can compose. a repository instruction can point to a review skill;
that skill can use an issue tracker connection and delegate an investigation.
keep each piece small enough to explain what it contributes. adding a second
place for the same rule gives you a second place to keep it current.

[permissions](https://code.claude.com/docs/en/permissions) control whether tool
actions proceed. the [Bash sandbox](https://code.claude.com/docs/en/sandboxing)
constrains filesystem and network access for commands inside it. the account
behind an external tool adds another boundary: a service can only grant the
access that identity has.

## follow the artifact through the workflow

### repository work has an inspectable ending

a useful session returns the change, the checks it ran, and whatever is still
uncertain. “tests pass” needs the command and result behind it. a screenshot
needs the route and state it shows. a proposed fix needs the behavior it is
supposed to change.

for parallel work, add the checkout and owner. for work that moves between
machines, add the environment and any state that stayed behind. these details
make it possible to resume a task without guessing what the previous session
meant by “done.”

### broader deliverables have a different starting point

[Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)
extends Claude into broader files and deliverables. an engineering task fits
Claude Code when its output belongs in a repository and needs the project’s
verification. a document or a collection of organized files has its own review
criteria. name the output first, then pick the workflow around it.

continue with [configuration](/guides/claude-code/configuration/) to make the
setup understandable, [extensions](/guides/claude-code/extensions/) to add
capabilities, or [recommendations](/guides/claude-code/recommendations/) to
choose a starting arrangement. the product explanations here are source based;
the personification observation above is personal.
