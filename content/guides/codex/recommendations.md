---
title: recommendations
description: simple codex defaults for different levels of technical familiarity and workflow intensity.
products: [codex]
updatedAt: "2026-09-07T15:01:58-04:00"
checkedAt: "2026-09-07T15:01:58-04:00"
status: current
completion: complete
evidence: [official-source, analysis]
sources: [openai-remote-connections, openai-codex-cloud, openai-codex-subagents, openai-codex-worktrees, openai-codex-skills, openai-codex-open-source]
redirects: []
voice: personal
navigation:
  scope: codex
  order: 70
---

## start with the work you need to coordinate

my interest in Codex centers on keeping multiple projects, tasks, and contexts
moving through one authoritative thread. that thread routes clearer prompts
and instructions to the tasks doing the work. the
[coordination example](/guides/codex/extensions/#task-coordination-and-subagents)
explains the division.

that gives this page a practical lens: choose the setup that makes the work
easy to locate, steer, and inspect. the following starting points depend on the
job and review surface.

| your work | a useful starting point |
| --- | --- |
| one repository change with a concrete test | CLI or editor, repository instructions, and the test command |
| several projects with separate implementation tasks | desktop task view and explicit ownership |
| an independent change beside unfinished local work | a dedicated worktree with its own setup |
| work you need to steer away from your desk | Remote connected to the host that has the environment |
| work suited to a separate hosted environment | Codex cloud with documented setup and verification |

these options can be combined. a phone can steer a task whose worktree lives
on another computer. the choice of screen and the choice of execution host
answer different questions. the [remote guide](https://learn.chatgpt.com/docs/remote-connections)
and [cloud guide](https://learn.chatgpt.com/docs/cloud) explain those environments.

## add parallelism around independent work

start with a task you know how to judge. when it contains independent
questions, give them to [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
with clear ownership and a useful result to return. an API investigation and
a UI investigation can often progress together. an implementation waiting on
an undecided API contract should wait for that decision.

for a trial, ask two agents to inspect different risks in the same patch.
compare their findings against your own review. then try a split implementation
with separate files or [worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees).
check the integrated behavior before increasing the amount of parallel work.

the benefit is the time saved reaching a correct result. extra summaries,
duplicate investigations, and conflicting patches count against that benefit.

## extend the part that keeps repeating

the capabilities i'm interested in include creating and messaging tasks,
reading their histories, checking current activity, and archiving completed
work. i'm also interested in changing the setup: instructions, configuration,
environment, and potentially the harness code.

for a recurring procedure, begin with a
[skill](https://learn.chatgpt.com/docs/build-skills). connect a service when the
procedure needs current external state. use a hook for a check tied to a
specific event. the [extensions chapter](/guides/codex/extensions/) explains
how these pieces fit together.

OpenAI publishes the CLI, SDK, and app server as
[open source](https://learn.chatgpt.com/docs/open-source). modifying that source
also means maintaining and running the changed implementation. choose that
route when a concrete limitation warrants the maintenance, and keep a way to
compare your change with the upstream behavior.

## judge the setup with a small comparison

choose a task that resembles your actual work. record how long it takes to
reach a reviewable result, what you needed to correct, which checks passed,
and how much steering it required. compare one change at a time: surface,
model, reasoning effort, or delegation pattern.

this gives a paid plan or more elaborate setup a practical test. use the
limits shown in your own account, because available models and allowances can
change. a setup is worth keeping when the improvement survives review and
recurs across the work you actually do.

## keep the result easy to inspect

before carrying a setup into a larger project, make sure you can answer four
questions: where is the work running, which task owns it, what can that task
reach, and what demonstrates that it finished? those answers make the next
change easier to supervise, whether you use one agent or several.
