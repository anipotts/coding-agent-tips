---
title: extensions
description: choosing and combining codex extensions by the job they do.
products: [codex]
updatedAt: "2026-09-07T15:01:58-04:00"
checkedAt: "2026-09-07T15:01:58-04:00"
status: current
completion: complete
draft: false
evidence: [official-source, analysis]
sources: [openai-codex-agents-md, openai-codex-skills, openai-codex-mcp, openai-codex-hooks, openai-codex-subagents, openai-codex-plugins, openai-codex-mcp-server, openai-codex-app-server, openai-codex-open-source]
redirects: []
voice: personal
navigation:
  scope: codex
  order: 50
---

## make operating knowledge reusable

### instructions route the repository context

project instructions give Codex the conventions it needs to work in a
repository. keep the entry point short: where the code lives, how to verify a
change, and which project documents explain the rest. a build command belongs
beside the code it verifies; the instruction file can point to it.

that also makes corrections easier. when a command changes, update its
canonical definition and keep the instruction pointing there.

### skills carry procedures, scripts, and references

a [skill](https://learn.chatgpt.com/docs/build-skills) is a directory with a
`SKILL.md` entry point and optional scripts, references, or assets. Codex sees
the name and description first, then reads the full instructions when it uses
the skill. the description therefore does real work: it helps decide when the
procedure belongs in the current task.

for example, a repository review skill could explain which checks apply to a
change and what evidence to return. its scripts handle repeatable checks; its
instructions explain how to interpret the results. write the trigger narrowly
enough that an ordinary question about the repository stays an ordinary question.

## connect a real system

### MCP exposes tools and resources

with [MCP](https://learn.chatgpt.com/docs/extend/mcp), Codex acts as a client of
another system. a server can run as a local process over stdio or expose a
Streamable HTTP endpoint. the tool connection gives Codex an operation it can
call; a skill can explain when that operation is useful.

there is also the reverse direction: another application calling Codex. as of
September 7, 2026, OpenAI marks the old
[`codex mcp-server`](https://learn.chatgpt.com/docs/mcp-server) command deprecated
and directs new integrations to the app server. connecting tools to Codex and
embedding Codex inside another product are separate integration decisions.

### authentication and reach stay explicit

MCP configuration belongs to the host making the connection. a local server
needs its executable and dependencies on that host; an HTTP server needs to be
reachable from it. authentication then determines which account the service
sees. the configured server, a successful login, and a successful tool call are
three separate things to check when a connection fails.

Codex exposes tool allow and deny lists plus approval settings for configured
servers. start with the operations the task needs and verify a harmless read
before relying on the connection for work.

## make events deterministic

[hooks](https://learn.chatgpt.com/docs/hooks) run scripts or MCP tools at defined
points in the agent loop. use a skill for a procedure the model interprets;
use a hook when a specific event should trigger the same check each time.

for example, a `SessionStart` hook can return the repository's current branch
and changed paths as context. a `PreToolUse` hook can inspect a proposed action
before it runs. keep the handler small enough to test directly with saved event
input, then confirm it runs in the installed Codex version.

Codex discovers hooks in user and project configuration, including
`.codex/hooks.json`. matching hooks from different sources all run, and command
hooks matching the same event can start concurrently. avoid designs where one
handler must finish before another can begin.

nonmanaged hooks require trust for their current definition. inspect them with
`/hooks` in the CLI after installation or changes. verify the successful case,
the rejected case, and a handler error. a hook that silently skips its check
leaves the session with a different policy than you intended.

## give work its own context

i use one authoritative Codex thread to keep track of multiple projects,
tasks, and contexts running in parallel. its job is to understand what's
happening across them, turn what i want into clearer prompts and instructions,
and send those to the right tasks. the actual code edits happen in the
individual project tasks. that's a concrete example of why agents being able
to communicate with other agents matters to me.

### subagents need a bounded problem

that setup involves coordinating separate Codex tasks, each with its own
ongoing work. a [subagent](https://learn.chatgpt.com/docs/agent-configuration/subagents)
handles a delegated part of a task in its own context. the useful distinction
is what work it owns and which conversation should receive the result.

the operations i'm interested in are concrete: create a task, message it,
read its history, check its current activity, and archive it when the work is
done. integrations can use the [app server](https://learn.chatgpt.com/docs/app-server)
for thread operations, history, and runtime events. history tells you what
has happened; status and new events help you keep up with what happens next.

### the return contract matters

the coordinator needs enough context to decide where the next instruction
belongs. a useful update identifies the task, what's changed, what remains,
and any decision or help it needs. the specific task keeps the detailed
implementation conversation; the coordinator keeps track of the work across
projects.

there's also being able to change the setup itself: instructions, config,
environment, and potentially the harness code. OpenAI publishes the
Codex CLI, SDK, and app server as [open source](https://learn.chatgpt.com/docs/open-source).
editing a configuration file changes the setup; changing the implementation
means working with that source and running the changed version. that's the
kind of extensibility i'm interested in.

### try a bounded delegation

for a change that touches both rendering and data loading, a useful request is:

```text
use two subagents to review this branch against main.
one owns data loading and error handling; the other owns rendering and accessibility.
both should inspect without editing and return concrete findings with file references.
wait for both, reconcile overlaps, and give me the issues that matter before release.
```

use the project's actual base branch if it differs. separate questions let the
agents investigate in parallel without writing over each other. the main task
still needs to check whether a finding is valid and whether two reports describe
the same bug. more reports can increase the amount of review you owe the work.

## package behavior for reuse

a [plugin](https://learn.chatgpt.com/docs/build-plugins) packages related skills,
MCP connections, and supported extensions for installation. a reusable review
workflow might contain the procedure, a source lookup connection, and a small
validation hook. a personal skill can stay a skill until there is a reason to
install and maintain those pieces together.

for a package you share, record its owner, version, dependencies, required
access, and removal instructions. test from a clean session with representative
requests. verify that the intended workflow activates and that ordinary tasks
remain ordinary tasks. publishing a package makes its maintenance part of the
workflow.

## compose around a recurring job

consider a release check: `AGENTS.md` points to the project's check command, a
skill explains the release procedure, an MCP connection reads CI status, and a
subagent reviews the changed API contract. each piece has an identifiable
reason to be there.

trace a failure through those pieces. if the procedure chose the wrong check,
fix the skill. if the service rejected the request, inspect the connection and
identity. if an approval rule blocked an action, inspect the policy and the
action it evaluated. keeping these responsibilities distinct makes the setup
easier to debug and remove when it stops being useful.
