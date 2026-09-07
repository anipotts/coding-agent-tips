---
title: start here
description: a quick agent crash course, your first task, and how to check the result.
products: [codex, claude-code]
updatedAt: "2026-09-07T16:33:00-04:00"
checkedAt: "2026-09-07T16:30:42-04:00"
status: current
evidence: [official-source, analysis]
sources: [anthropic-how-claude-code-works, anthropic-features-overview, openai-codex-agents-md, anthropic-memory, github-protected-branches, openai-codex-approvals, anthropic-permissions, git-worktrees]
redirects: [/guides/operating-system/]
voice: evidence
navigation:
  scope: handbook
  order: 10
---

this assumes you know basic coding. the new part is working with something
that can inspect your project, choose actions, and keep going between your
messages. already comfortable with the terms? [try the first task](#what-should-i-ask-first).

## the agent crash course

- **model and harness.** the model interprets your request and chooses a next
  step. the harness is the software around it: tools, context, permissions,
  and the interface you use. together they can run an
  [agent loop](https://code.claude.com/docs/en/how-claude-code-works): inspect,
  act, check the result, repeat.
- **tools.** these let an agent do things: read a file, edit code, run a test,
  or use a browser. each result becomes information for its next step.
- **context and tokens.** context is the information available for the current
  response. tokens are the chunks used to measure it. a
  [context window](https://code.claude.com/docs/en/how-claude-code-works#the-context-window)
  has a limit; a long conversation can require summarizing or dropping earlier detail.
- **instructions and memory.** files such as `AGENTS.md`, `CLAUDE.md`, and saved
  notes can carry information into later sessions when loaded. they
  [supply context](https://code.claude.com/docs/en/memory); they do not retrain the model.
- **permissions.** these determine which actions can proceed and which need
  your approval. [check the settings](#will-it-ask-before-acting) before giving
  it work with consequences.

skills, MCP, subagents, and hooks are ways to
[add capabilities](https://code.claude.com/docs/en/features-overview).
you can explore those when a task gives you a reason to.

<span id="begin-with-a-behavior-you-can-check" class="heading-alias" aria-hidden="true"></span>

## what should i ask first?

consider a search box that loses its query when you open a result and return.
a useful request gives the agent enough context to reproduce that behavior:

```text
on /search, enter "permissions", open a result, then go back.
the query disappears. preserve the query and selected filters when returning.
inspect the existing routing behavior and make the smallest coherent fix.
add a regression check and verify the flow in the browser.
keep the patch local for review.
```

the task has an observable failure and a finish line. the agent can choose
where to inspect and how to implement the change. you can judge whether it
preserves the state and still handles a fresh visit, an empty query, and a
shared search URL correctly.

if the agent finds that the requested behavior conflicts with the product's
existing rules, resolve that decision before it builds around an assumption.
a clear prompt leaves room to discover the cause.

<span id="make-project-context-easy-to-find" class="heading-alias" aria-hidden="true"></span>

## why am i repeating myself?

start with the repository's current state: branch, existing edits, setup,
relevant code, and checks. preserve work that belongs to other people or tasks.
put recurring project facts in the readme, package scripts, tests, and
architecture notes where every contributor can find them.

[`AGENTS.md`](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and
[`CLAUDE.md`](https://code.claude.com/docs/en/memory) can point the agent toward
that context. Claude Code supports importing a shared `AGENTS.md` from
`CLAUDE.md` using `@AGENTS.md`. keep instructions specific to each runtime
beside that shared material when needed.

record the details that change behavior: which package owns routing, how to run
its checks, and which generated files come from another source. move procedures
used only for particular jobs into skills or focused references. update the
canonical command when it changes so the next task can find it.

<span id="separate-guidance-from-enforcement" class="heading-alias" aria-hidden="true"></span>

## will it ask before acting?

instructions guide the agent's judgment. runtime settings and permissions
constrain actions. hooks run handlers at specific events. provider controls
can enforce requirements when a change reaches a shared system.

for example, asking the agent to run tests helps it follow the repository's
process. [required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
can make passing checks a condition of merging. inspect which branches and
actors the protection covers, including any bypass permissions.

choose access for the actual job. a local UI fix needs different capabilities
from a production deployment. [Codex permissions](https://learn.chatgpt.com/docs/agent-approvals-security)
and [Claude Code permissions](https://code.claude.com/docs/en/permissions)
expose different controls; connected services also enforce their own account
permissions. credentials being available tells you what a tool may be able to
do. the task and applicable policy establish what it should do.

<span id="split-work-where-it-can-advance-independently" class="heading-alias" aria-hidden="true"></span>

## when should i use more agents?

an agent can investigate the search state while another reviews keyboard and
browser navigation behavior. both can return findings to the task implementing
the fix. decide who owns any edits before asking both to change the same area.

[Git worktrees](https://git-scm.com/docs/git-worktree) provide separate checkouts
for independent branches. runtime resources can still overlap: ports,
databases, browser sessions, generated output, and external accounts. configure separate
databases or ports explicitly when the tasks need them.

keep coordination focused on the outcome, dependencies, decisions, and results.
implementation tasks retain the detailed debugging work. a useful update says
what changed and what the coordinator needs to do next. repeated progress
messages without a changed state add reading work.

parallelism helps when those results can be combined cheaply. when both agents
need the same unresolved contract, settle the contract first. review the
combined behavior after integration, including interactions that neither task
could test alone.

<span id="verify-the-claim-you-are-making" class="heading-alias" aria-hidden="true"></span>

## it says it’s done. now what?

use evidence at the layer the claim describes:

| claim | evidence to inspect |
| --- | --- |
| the parser handles an empty query | a focused test with the expected result |
| returning to search preserves state | the actual browser navigation flow |
| the fix is ready for integration | the diff and applicable checks for that revision |
| the change is deployed | the deployed revision and behavior on the public route |
| an external action completed | the destination system's resulting state |

when a check fails, establish whether it exposes a regression, an existing
failure, or an unavailable dependency. keep the reason with the result. a
passing substitute check can support a narrower claim; state that scope.

review the implementation as well as the output. check error handling, fit with
the existing code, security implications, and the maintenance the change adds.
tests can pass around an unnecessary abstraction or a misunderstood requirement.

<span id="hand-off-a-state-someone-can-continue" class="heading-alias" aria-hidden="true"></span>

## how do i pick this up later?

finish with the changed behavior, files or revision, verification, unresolved
gaps, and next action. an illustrative handoff for the hypothetical search fix could say:

```text
query and filters now survive opening a result and returning.
the routing regression check and browser navigation check passed.
the patch is local; review the URL behavior before opening the pull request.
```

use the actual results in a real handoff. keep private transcripts,
credentials, and unrelated context out of public project notes.

when a task changes host, agent, or conversation, recheck the repository and
external state before continuing. a useful handoff provides the starting point;
the current environment tells you whether that starting point still holds.
