---
title: working with coding agents
description: durable instructions, evidence, isolation, approvals, verification, and handoffs across coding agent runtimes.
products: [codex, claude-code]
updatedAt: "2026-09-07T15:05:08-04:00"
checkedAt: "2026-09-07T15:05:08-04:00"
status: current
evidence: [official-source, analysis]
sources: [openai-codex-agents-md, anthropic-memory, github-protected-branches, openai-codex-approvals, anthropic-permissions, git-worktrees]
redirects: [/guides/operating-system/]
voice: evidence
navigation:
  scope: handbook
  order: 10
---

an agent task is easier to manage when three things stay visible: what it is
trying to finish, what it can reach, and what evidence will show that it worked.
these questions apply across the Codex and Claude Code chapters.

## begin with a behavior you can check

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

## make project context easy to find

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

## separate guidance from enforcement

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

## split work where it can advance independently

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

## verify the claim you are making

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

## hand off a state someone can continue

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
